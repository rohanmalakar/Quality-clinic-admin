export class CustomError extends Error {
    message: string
    code: number

    constructor(message : string, statusCode: number) {
        super(message);
        this.message = message;
        this.code = statusCode;
    }
}

export const ERRORS = {
    // COMMON ERRORS
    SERVER_ERROR: new CustomError('Server error', 10000),
    FORM_NOT_FILLED: new CustomError('Please fill in all fields', 10001),
    LANG_LAT_NOT_NUMBER: new CustomError('Latitude and longitude must be numbers', 10002),
    UNAUTHORIZED: new CustomError('Unauthorized', 10003),
    NO_CHANGES: new CustomError('No changes made', 10004),
    
    
    // LOGIN ERRORS
    INVALID_EMAIL: new CustomError('Invalid email address', 10002),
    INVALID_CREDENTIALS: new CustomError('Invalid email or password', 10003),

    // MARKETING ERROR
    EN_IMAGE_REQUIRED: new CustomError('English image is required', 10004),
    AR_IMAGE_REQUIRED: new CustomError('Arabic image is required', 10005),
    START_DATE_REQUIRED: new CustomError('Start date is required', 10006),
    END_DATE_REQUIRED: new CustomError('End date is required', 10007),
    LINK_REQUIRED: new CustomError('Link is required', 10008),

    // For Category Errors
    NAME_EN_REQUIRED: new CustomError('English name is required', 20001),
    NAME_AR_REQUIRED: new CustomError('Arabic name is required', 20002),
    TYPE_REQUIRED: new CustomError('Type is required', 20003),
    IMAGE_REQUIRED: new CustomError('Image is required', 20004),

    // For Service Errors
    SERVICE_NAME_EN_REQUIRED: new CustomError('English name is required', 40001),
    SERVICE_NAME_AR_REQUIRED: new CustomError('Arabic name is required', 40002),
    CATEGORY_REQUIRED: new CustomError('Category is required', 40003),
    ABOUT_EN_REQUIRED: new CustomError('English about is required', 40005),
    ABOUT_AR_REQUIRED: new CustomError('Arabic about is required', 40006),
    ACTUAL_PRICE_REQUIRED: new CustomError('Actual price is required', 40007),
    DISCOUNTED_PRICE_REQUIRED: new CustomError('Discounted price is required', 40008),
    CATEGORY_ID_REQUIRED: new CustomError('Category id is required', 40009),
    SERVICE_IMAGE_EN_REQUIRED: new CustomError('English image is required', 40010),
    SERVICE_IMAGE_AR_REQUIRED: new CustomError('Arabic image is required', 40011),
    CAN_REDEEM_REQUIRED: new CustomError('Can redeem is required', 40012),

    BRANCH_REQUIRED: new CustomError('Branch is required', 40013),
    TIME_SLOT_REQUIRED: new CustomError('Service is required', 40014),


    DOCTOR_ABOUT_AR_REQUIRED: new CustomError('Arabic about is required', 50001),
    DOCTOR_ABOUT_EN_REQUIRED: new CustomError('English about is required', 50002),
    DOCTOR_ATTENDED_PATIENT_REQUIRED: new CustomError('Attended patient is required', 50003),
    DOCTOR_SESSION_FEES_REQUIRED: new CustomError('Session fees is required', 50004),
    DOCTOR_TOTAL_EXPERIENCE_REQUIRED: new CustomError('Total experience is required', 50005),
    DOCTOR_NAME_AR_REQUIRED: new CustomError('Arabic name is required', 50006),
    DOCTOR_NAME_EN_REQUIRED: new CustomError('English name is required', 50007),
    DOCTOR_QUALIFICATION_REQUIRED: new CustomError('Qualification is required', 50008),
    DOCTOR_LANGUAGES_REQUIRED: new CustomError('Languages is required', 50009),
    DOCTOR_PHOTO_URL_REQUIRED: new CustomError('Photo url is required', 50010),
    DOCTOR_BRANCH_REQUIRED: new CustomError('Branch is required', 50011),
    DOCTOR_TIME_SLOT_REQUIRED: new CustomError('Time slot is required', 50012),


    NOTIFICATION_MESSAGE_AR_REQUIRED: new CustomError('Arabic message is required', 60001),
    NOTIFICATION_MESSAGE_EN_REQUIRED: new CustomError('English message is required', 60002),
    NOTIFICATION_SCHEDULED_TIMESTAMP_REQUIRED: new CustomError('Scheduled timestamp is required', 60003),
    NOTIFICATION_TITLE_AR_REQUIRED: new CustomError('Arabic title is required', 60004),
    NOTIFICATION_TITLE_EN_REQUIRED: new CustomError('English title is required', 60005),
    
    
}