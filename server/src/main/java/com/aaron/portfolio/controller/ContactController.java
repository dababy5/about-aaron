package com.aaron.portfolio.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aaron.portfolio.dto.ContactRequest;
import com.aaron.portfolio.service.EmailService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/contact")
public class ContactController {
    @Autowired
    EmailService emailService;

    @PostMapping
    public ResponseEntity<?> sendContactMessage(@Valid @RequestBody ContactRequest form) {
        return emailService.sendEmail(form);
    }
}
