package com.example.api_gateway.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter
import org.springframework.security.web.csrf.CookieCsrfTokenRepository

@Configuration
class SecurityConfig(val crr: ClientRegistrationRepository) {

    fun oidcLogoutSuccessHandler() = OidcClientInitiatedLogoutSuccessHandler(crr)
            .also { it.setPostLogoutRedirectUri("http://localhost:8080/") }

    @Bean
    fun securityFilterChain(httpSecurity: HttpSecurity): SecurityFilterChain{
        return httpSecurity
                .authorizeHttpRequests{
                    it.requestMatchers("/","/login", "/logout").permitAll()
                    it.requestMatchers("/secure").authenticated()
                    it.requestMatchers("/anon").anonymous()
                    it.requestMatchers("/ui/**").permitAll()
                    it.anyRequest().permitAll()
                }
                .oauth2Login { }
                .logout { it.logoutSuccessHandler(oidcLogoutSuccessHandler()) }
                .csrf { it.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                    it.csrfTokenRequestHandler(SpaCsrfTokenRequestHandler()) }
                .addFilterAfter(CsrfCookieFilter(), BasicAuthenticationFilter::class.java)


                .build()
    }
}