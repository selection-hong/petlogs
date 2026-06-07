package com.pettrainer.pro.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * REST API + 정적 프론트엔드(SPA) 서빙 설정.
 *
 * <p>프론트엔드(Vue 3 SPA)는 {@code src/main/resources/static/} 에 위치하며,
 * Spring Boot 정적 리소스 핸들러가 루트("/")에서 {@code index.html} 을 그대로 서빙한다.
 * SPA는 해시 라우팅(#/...)을 사용하므로 별도의 서버 포워딩이 필요 없다.
 *
 * <p>Swagger UI 는 개발 편의를 위해 "/docs" 로 접근할 수 있도록 리다이렉트만 추가한다.
 * (루트 "/" 는 SPA가 차지하므로 더 이상 Swagger로 리다이렉트하지 않는다.)
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // API 문서 진입 단축 경로
        registry.addRedirectViewController("/docs", "/swagger-ui/index.html");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 업로드 파일(survey_image / training_log_image) 정적 제공
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/");
    }
}
