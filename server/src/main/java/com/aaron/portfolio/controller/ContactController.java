package com.aaron.portfolio.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aaron.portfolio.dto.ContactRequest;
import com.aaron.portfolio.service.EmailService;

@RestController
@RequestMapping("/api/contact")
public class ContactController {
    @Autowired
    EmailService emailService; 
    @PostMapping
    public ResponseEntity<?> sendContactMessage(@RequestBody ContactRequest form) {
        // Implement the logic to handle the contact form submission
        return emailService.sendEmail(form);
    }
}
