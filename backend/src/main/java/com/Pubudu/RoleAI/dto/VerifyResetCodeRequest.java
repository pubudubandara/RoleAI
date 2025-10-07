package com.Pubudu.RoleAI.dto;

public class VerifyResetCodeRequest {
    private String email;
    private String resetCode;

    public VerifyResetCodeRequest() {}

    public VerifyResetCodeRequest(String email, String resetCode) {
        this.email = email;
        this.resetCode = resetCode;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getResetCode() {
        return resetCode;
    }

    public void setResetCode(String resetCode) {
        this.resetCode = resetCode;
    }
}