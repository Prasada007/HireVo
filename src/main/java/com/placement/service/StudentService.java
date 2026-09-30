package com.placement.service;

import com.placement.dto.StudentRegisterRequest;
import com.placement.model.Student;
import com.placement.repository.StudentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Student register(StudentRegisterRequest req) {
        if (studentRepo.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        Student student = new Student();
        student.setRollNumber(req.getRollNumber());
        student.setName(req.getName());
        student.setEmail(req.getEmail());
        student.setPhone(req.getPhone());
        student.setBranch(req.getBranch());
        student.setCgpa(req.getCgpa());
        student.setYearOfPassing(req.getYearOfPassing());
        student.setPassword(passwordEncoder.encode(req.getPassword()));
        student.setHasBacklog(false);
        return studentRepo.save(student);
    }

    public List<Student> getAllStudents() {
        return studentRepo.findAll();
    }

    public Optional<Student> getById(Integer id) {
        return studentRepo.findById(id);
    }

    public Optional<Student> getByEmail(String email) {
        return studentRepo.findByEmail(email);
    }

    public Student update(Integer id, Student updated, boolean isAdmin) {
        Student existing = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        if (updated.getName() != null) existing.setName(updated.getName());
        if (updated.getPhone() != null) existing.setPhone(updated.getPhone());
        
        // Only Admin can alter academic standing
        if (isAdmin) {
            if (updated.getCgpa() != null) existing.setCgpa(updated.getCgpa());
            if (updated.getBranch() != null) existing.setBranch(updated.getBranch());
            if (updated.getHasBacklog() != null) existing.setHasBacklog(updated.getHasBacklog());
        }
        return studentRepo.save(existing);
    }
}