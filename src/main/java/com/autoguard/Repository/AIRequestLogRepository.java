package com.autoguard.Repository;

import com.autoguard.Model.AiRequestLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AIRequestLogRepository
        extends JpaRepository<AiRequestLog, Long> {

    List<AiRequestLog> findAllByOrderByCreatedAtDesc();
}