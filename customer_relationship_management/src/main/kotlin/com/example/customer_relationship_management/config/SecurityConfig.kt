package com.example.customer_relationship_management.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.convert.converter.Converter
import org.springframework.http.HttpMethod
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtClaimNames
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter
import org.springframework.security.web.csrf.CookieCsrfTokenRepository
import org.springframework.stereotype.Component
import org.springframework.validation.annotation.Validated
import java.util.stream.Collectors
import java.util.stream.Stream

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig(private val jwtAuthConverter: JwtAuthConverter) {
    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        return http.authorizeHttpRequests {
            it.requestMatchers(HttpMethod.GET, "/contacts/**").hasAnyAuthority("ROLE_manager","ROLE_guest","ROLE_operator")
                    .requestMatchers(HttpMethod.GET, "/customers/**").hasAnyAuthority("ROLE_manager","ROLE_guest","ROLE_operator")
                    .requestMatchers(HttpMethod.GET, "/joboffers/**").hasAnyAuthority("ROLE_manager","ROLE_guest","ROLE_operator")
                    .requestMatchers(HttpMethod.GET, "/messages/**").hasAnyAuthority("ROLE_manager","ROLE_guest","ROLE_operator")
                    .requestMatchers(HttpMethod.GET, "/professionals/**").hasAnyAuthority("ROLE_manager","ROLE_guest","ROLE_operator")
                    .requestMatchers(HttpMethod.GET, "/skills/**").hasAnyAuthority("ROLE_manager","ROLE_guest","ROLE_operator")

                    .requestMatchers(HttpMethod.POST, "/contacts/**").hasAnyAuthority("ROLE_manager","ROLE_operator")
                    .requestMatchers(HttpMethod.POST, "/customers/**").hasAnyAuthority("ROLE_manager","ROLE_operator")
                    .requestMatchers(HttpMethod.POST, "/joboffers/**").hasAnyAuthority("ROLE_manager","ROLE_operator")
                    .requestMatchers(HttpMethod.POST, "/messages/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/professionals/**").hasAnyAuthority("ROLE_manager","ROLE_operator")
                    .requestMatchers(HttpMethod.POST, "/skills/**").hasAnyAuthority("ROLE_manager","ROLE_operator")

                    .requestMatchers(HttpMethod.PUT, "/contacts/**").hasAnyAuthority("ROLE_manager","ROLE_operator")
                    .requestMatchers(HttpMethod.PUT, "/customers/**").hasAnyAuthority("ROLE_manager","ROLE_operator")
                    .requestMatchers(HttpMethod.PUT, "/joboffers/**").hasAnyAuthority("ROLE_manager","ROLE_operator")
                    .requestMatchers(HttpMethod.PUT, "/messages/**").hasAnyAuthority("ROLE_manager","ROLE_operator")
                    .requestMatchers(HttpMethod.PUT, "/professionals/**").hasAnyAuthority("ROLE_manager","ROLE_operator")
                    .requestMatchers(HttpMethod.PUT, "/skills/**").hasAnyAuthority("ROLE_manager","ROLE_operator")

                    .requestMatchers(HttpMethod.DELETE, "/contacts/**").hasAuthority("ROLE_manager")
                    .requestMatchers(HttpMethod.DELETE, "/customers/**").hasAuthority("ROLE_manager")
                    .requestMatchers(HttpMethod.DELETE, "/joboffers/**").hasAuthority("ROLE_manager")
                    .requestMatchers(HttpMethod.DELETE, "/messages/**").hasAuthority("ROLE_manager")
                    .requestMatchers(HttpMethod.DELETE, "/professionals/**").hasAuthority("ROLE_manager")
                    .requestMatchers(HttpMethod.DELETE, "/skills/**").hasAuthority("ROLE_manager")
                    .anyRequest().denyAll()
        }
                .oauth2ResourceServer {
                    it.jwt {jwtConfigurer ->
                        jwtConfigurer.jwtAuthenticationConverter(jwtAuthConverter)
                    }
                }
                .sessionManagement { it.sessionCreationPolicy( SessionCreationPolicy.STATELESS) }
                .csrf { it.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                    it.csrfTokenRequestHandler(SpaCsrfTokenRequestHandler()) }
                .cors { it.disable() }
                .addFilterAfter(CsrfCookieFilter(), BasicAuthenticationFilter::class.java)
                .build()
    }
}

@Validated
@Configuration
@ConfigurationProperties(prefix = "jwt.auth.converter")
class JwtAuthConfigurationProperties {
    private var jwtResourceId : String? = null
    private var jwtPrincipalAttribute: String? = null

    fun getJwtPrincipalAttribute(): String? {
        return this.jwtPrincipalAttribute
    }

    fun setJwtPrincipalAttribute(jwtPrincipalAttribute: String) {
        this.jwtPrincipalAttribute = jwtPrincipalAttribute
    }

    fun setJwtResourceId(jwtResourceId: String) {
        this.jwtResourceId  = jwtResourceId
    }

    fun getJwtResourceId(): String? {
        return this.jwtResourceId
    }
}

@Component
class JwtAuthConverter(
    private val jwtProperties: JwtAuthConfigurationProperties
) : Converter<Jwt, AbstractAuthenticationToken> {
    private val jwtGrantedAuthoritiesConverter = JwtGrantedAuthoritiesConverter()

    override fun convert(jwt: Jwt): AbstractAuthenticationToken {
        val authorities: Collection<GrantedAuthority> = Stream.concat(
                jwtGrantedAuthoritiesConverter.convert(jwt)!!.stream(),
                extractCustomRoles(jwt).stream()
        ).collect(Collectors.toSet())

        return JwtAuthenticationToken(jwt, authorities, getPrincipalClaim(jwt))
    }

    private fun getPrincipalClaim(jwt: Jwt): String? {
        val claimName = jwtProperties.getJwtPrincipalAttribute() ?: JwtClaimNames.SUB
        return jwt.getClaim(claimName)
    }

    private fun extractCustomRoles(jwt: Jwt): Collection<GrantedAuthority> {
        val resourceAccess: Map<String, Any>? = jwt.getClaim("realm_access")

        return if (resourceAccess != null && resourceAccess.containsKey("roles")) {
            @Suppress("UNCHECKED_CAST")
            val resourceRoles = resourceAccess["roles"] as Collection<String>
            resourceRoles.stream()
                    .map { SimpleGrantedAuthority("ROLE_$it") }
                    .collect(Collectors.toSet())
        } else {
            emptySet()
        }
    }
}