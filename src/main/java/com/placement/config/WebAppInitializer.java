package com.placement.config;

import jakarta.servlet.FilterRegistration;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRegistration;
import org.springframework.security.web.context.AbstractSecurityWebApplicationInitializer;
import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.filter.DelegatingFilterProxy;
import org.springframework.web.servlet.DispatcherServlet;

public class WebAppInitializer implements WebApplicationInitializer {

    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {

        AnnotationConfigWebApplicationContext context =
                new AnnotationConfigWebApplicationContext();

        context.register(
                AppConfig.class,
                HibernateConfig.class,
                SecurityConfig.class
        );

        FilterRegistration.Dynamic securityFilter = servletContext.addFilter(
                AbstractSecurityWebApplicationInitializer.DEFAULT_FILTER_NAME,
                new DelegatingFilterProxy(
                        AbstractSecurityWebApplicationInitializer.DEFAULT_FILTER_NAME,
                        null
                )
        );
        securityFilter.addMappingForUrlPatterns(null, false, "/*");

        DispatcherServlet dispatcher = new DispatcherServlet(context);
        ServletRegistration.Dynamic registration =
                servletContext.addServlet("dispatcher", dispatcher);
        registration.setLoadOnStartup(1);
        registration.addMapping("/");

        registration.setMultipartConfig(
                new jakarta.servlet.MultipartConfigElement(
                        "",
                        2 * 1024 * 1024,  // max file size 2MB
                        4 * 1024 * 1024,  // max request size 4MB
                        0
                )
        );
    }
}