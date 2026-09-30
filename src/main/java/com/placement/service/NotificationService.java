package com.placement.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationService {

    // Store active SSE connections: email -> list of open browser tabs/connections
    private final Map<String, CopyOnWriteArrayList<SseEmitter>> userEmitters = new ConcurrentHashMap<>();

    // Track user roles: email -> role (STUDENT, COMPANY, ADMIN)
    private final Map<String, String> userRoles = new ConcurrentHashMap<>();

    // 30 minute timeout per SSE connection
    private static final Long EMITTER_TIMEOUT = 30 * 60 * 1000L;

    public SseEmitter subscribe(String email, String role) {
        SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT);

        userRoles.put(email, role.toUpperCase());
        userEmitters.computeIfAbsent(email, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(email, emitter));
        emitter.onTimeout(() -> removeEmitter(email, emitter));
        emitter.onError((e) -> removeEmitter(email, emitter));

        // Send initial confirmation event to verify active stream
        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data("{\"status\":\"CONNECTED\",\"message\":\"Real-time event stream established\"}"));
        } catch (IOException e) {
            removeEmitter(email, emitter);
        }

        return emitter;
    }

    public void sendToUser(String email, String eventName, Object data) {
        CopyOnWriteArrayList<SseEmitter> emitters = userEmitters.get(email);
        if (emitters != null) {
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event().name(eventName).data(data));
                } catch (IOException e) {
                    removeEmitter(email, emitter);
                }
            }
        }
    }

    public void sendToRole(String role, String eventName, Object data) {
        String targetRole = role.toUpperCase();
        for (Map.Entry<String, String> entry : userRoles.entrySet()) {
            if (entry.getValue().equalsIgnoreCase(targetRole)) {
                sendToUser(entry.getKey(), eventName, data);
            }
        }
    }

    public void broadcast(String eventName, Object data) {
        for (String email : userEmitters.keySet()) {
            sendToUser(email, eventName, data);
        }
    }

    private void removeEmitter(String email, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> emitters = userEmitters.get(email);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                userEmitters.remove(email);
                userRoles.remove(email);
            }
        }
    }
}
