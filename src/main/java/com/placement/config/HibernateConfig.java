package com.placement.config;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.Properties;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(basePackages = "com.placement.repository")
public class HibernateConfig {

    private String getEnvOrProp(String name, String fallback) {
        String val = System.getenv(name);
        if (val == null || val.trim().isEmpty()) {
            val = System.getProperty(name);
        }
        return (val != null && !val.trim().isEmpty()) ? val : fallback;
    }

    @Bean
    public DataSource dataSource() {
        String url = getEnvOrProp("DB_URL", "jdbc:mysql://localhost:3306/spms_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true");
        String username = getEnvOrProp("DB_USERNAME", "root");
        String password = getEnvOrProp("DB_PASSWORD", "");

        com.zaxxer.hikari.HikariConfig config = new com.zaxxer.hikari.HikariConfig();
        config.setDriverClassName("com.mysql.cj.jdbc.Driver");
        config.setJdbcUrl(url);
        config.setUsername(username);
        config.setPassword(password);

        // Connection pool sizing and timeouts for high-concurrency real-time users
        int maxPoolSize = Integer.parseInt(getEnvOrProp("DB_POOL_MAX_SIZE", "15"));
        int minIdle = Integer.parseInt(getEnvOrProp("DB_POOL_MIN_IDLE", "5"));
        config.setMaximumPoolSize(maxPoolSize);
        config.setMinimumIdle(minIdle);
        config.setIdleTimeout(300000);        // 5 minutes
        config.setConnectionTimeout(20000);   // 20 seconds
        config.setMaxLifetime(1200000);       // 20 minutes
        config.setPoolName("HireVoHikariPool");

        // MySQL statement cache optimizations
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
        config.addDataSourceProperty("useServerPrepStmts", "true");

        return new com.zaxxer.hikari.HikariDataSource(config);
    }

    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory() {
        LocalContainerEntityManagerFactoryBean em =
                new LocalContainerEntityManagerFactoryBean();

        em.setDataSource(dataSource());
        em.setPackagesToScan("com.placement.model");
        em.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        em.setJpaProperties(hibernateProperties());

        return em;
    }

    private Properties hibernateProperties() {
        Properties props = new Properties();
        props.setProperty("hibernate.dialect", "org.hibernate.dialect.MySQLDialect");

        // Control SQL logging to prevent stdout lag under concurrent user load
        String showSql = getEnvOrProp("HIBERNATE_SHOW_SQL", "false");
        String formatSql = getEnvOrProp("HIBERNATE_FORMAT_SQL", "false");
        String ddlAuto = getEnvOrProp("HIBERNATE_DDL_AUTO", "update");

        props.setProperty("hibernate.show_sql", showSql);
        props.setProperty("hibernate.format_sql", formatSql);
        props.setProperty("hibernate.hbm2ddl.auto", ddlAuto);

        // JDBC batching optimization for bulk insertions (e.g., auto-shortlisting)
        props.setProperty("hibernate.jdbc.batch_size", "25");
        props.setProperty("hibernate.order_inserts", "true");
        props.setProperty("hibernate.order_updates", "true");

        return props;
    }

    @Bean
    public PlatformTransactionManager transactionManager(
            EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}