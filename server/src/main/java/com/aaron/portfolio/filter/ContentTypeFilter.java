package com.aaron.portfolio.filter;

import java.io.IOException;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
@Order(1)
public class ContentTypeFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpReq = (HttpServletRequest) request;
        String path = httpReq.getRequestURI();
        String method = httpReq.getMethod();

        // Only enforce on POST/PUT/PATCH to API endpoints
        if (path.startsWith("/api/") && ("POST".equals(method) || "PUT".equals(method) || "PATCH".equals(method))) {
            String contentType = httpReq.getContentType();
            if (contentType == null || !contentType.contains("application/json")) {
                HttpServletResponse httpRes = (HttpServletResponse) response;
                httpRes.setStatus(415);
                httpRes.setContentType("application/json");
                httpRes.getWriter().write("{\"error\":\"Content-Type must be application/json\"}");
                return;
            }
        }

        chain.doFilter(request, response);
    }
}
