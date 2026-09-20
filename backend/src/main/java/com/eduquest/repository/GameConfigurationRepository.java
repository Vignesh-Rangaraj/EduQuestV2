package com.eduquest.repository;

import com.eduquest.domain.GameConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GameConfigurationRepository extends JpaRepository<GameConfiguration, Long> {

    Optional<GameConfiguration> findByActivityId(Long activityId);
}
