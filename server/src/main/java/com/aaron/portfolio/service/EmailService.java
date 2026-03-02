package com.aaron.portfolio.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.aaron.portfolio.dto.ContactRequest;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.gmail}")
    private String gmail;

    public ResponseEntity<?> sendEmail(ContactRequest form) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(gmail); // Set the recipient's email address
        message.setText(
        "New Contact Form Submission\n\n" +
        "From: " + form.getEmail() + "\n" +
        "Message:\n" +
        form.getMessage()
        );
        message.setSubject(form.getSubject());
        mailSender.send(message);
        return ResponseEntity.status(200).body("Email Sent");
    }
    
}
