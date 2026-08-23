package com.autoguard.Controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ── 403 Access Denied ────────────────────────────────────────
    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public String handleAccessDenied(
            AccessDeniedException ex,
            HttpServletRequest request,
            Model model) {
        log.warn("Access denied for URL: {}", request.getRequestURI());
        model.addAttribute("url", request.getRequestURI());
        return "error/403";
    }

    // ── 404 Resource Not Found ───────────────────────────────────
    @ExceptionHandler(RuntimeException.class)
    public String handleRuntimeException(
            RuntimeException ex,
            HttpServletRequest request,
            Model model) {
        String message = ex.getMessage();

        // Route not-found errors to 404
        if (message != null && (
                message.contains("not found") ||
                        message.contains("No value present"))) {
            log.warn("Resource not found: {} | URL: {}",
                    message, request.getRequestURI());
            model.addAttribute("message", message);
            return "error/404";
        }

        // All other runtime errors go to 500
        log.error("Unhandled exception at URL {}: {}",
                request.getRequestURI(), message, ex);
        model.addAttribute("message", message);
        return "error/500";
    }

    // ── 500 General Exception ────────────────────────────────────
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public String handleGenericException(
            Exception ex,
            HttpServletRequest request,
            Model model) {
        log.error("Exception at URL {}: {}",
                request.getRequestURI(), ex.getMessage(), ex);
        model.addAttribute("message", ex.getMessage());
        return "error/500";
    }
}