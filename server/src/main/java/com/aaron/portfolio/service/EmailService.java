package com.aaron.portfolio.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.aaron.portfolio.dto.ContactRequest;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.gmail}")
    private String gmail;

    public ResponseEntity<?> sendEmail(ContactRequest form) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(gmail);
            message.setText(
                "New Contact Form Submission\n\n" +
                "From: " + form.getEmail() + "\n" +
                "Message:\n" +
                form.getMessage()
            );
            message.setSubject(form.getSubject());
            mailSender.send(message);
            return ResponseEntity.ok().body("{\"status\":\"sent\"}");
        } catch (Exception e) {
            log.error("Failed to send contact email", e);
            return ResponseEntity.internalServerError()
                    .body("{\"error\":\"Something went wrong. Please try again.\"}");
        }
    }
}
