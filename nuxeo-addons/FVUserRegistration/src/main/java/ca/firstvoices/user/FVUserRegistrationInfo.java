package ca.firstvoices.user;

import org.nuxeo.ecm.user.invite.UserRegistrationInfo;

public class FVUserRegistrationInfo extends UserRegistrationInfo {

    protected String requestedSpace;

    protected String preferences;

    protected String ageGroup;

    protected String role;

    protected String comment;

    public FVUserRegistrationInfo() {
    }

    public String getPreferences() {
        return preferences;
    }

    public void setPreferences(String preferences) {
        this.preferences = preferences;
    }

    public void setRequestedSpace(String requestedSpace) {
        this.documentId = requestedSpace;
        this.requestedSpace = requestedSpace;
    }

    public String getRequestedSpace() {
        return requestedSpace;
    }

    public String getAgeGroup() {
        return ageGroup;
    }

    public void setAgeGroup(String ageGroup) {
        this.ageGroup = ageGroup;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

}