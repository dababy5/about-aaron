package com.aaron.portfolio.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller to handle SPA (Single Page Application) routing.
 * Forwards all non-API routes to index.html so React Router can handle them.
 */
@Controller
public class SpaController {

    @GetMapping(value = {"/", "/about", "/projects", "/experience", "/skills", "/contact"})
    public String forward() {
        return "forward:/index.html";
    }
}
