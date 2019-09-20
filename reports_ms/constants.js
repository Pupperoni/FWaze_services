module.exports = {
  COMMANDS: {
    // User aggregates constants
    CREATE_USER: "create_user",
    UPDATE_USER: "update_user",
    UPDATE_USER_HOME: "update_user_home",
    UPDATE_USER_WORK: "update_user_work",
    CREATE_USER_ROUTE: "create_user_route",
    DELETE_USER_ROUTE: "delete_user_route",
    CREATE_USER_APPLICATION: "create_user_application",
    APPROVE_USER_APPLICATION: "approve_user_application",
    REJECT_USER_APPLICATION: "reject_user_application",

    // Report aggregate constants
    CREATE_REPORT: "create_report",
    UPDATE_REPORT_USER_NAME: "update_report_user_name",
    CREATE_REPORT_VOTE: "create_report_vote",
    DELETE_REPORT_VOTE: "delete_report_vote",
    CREATE_REPORT_COMMENT: "create_report_comment",

    // Advertistement aggregate constants
    CREATE_AD: "create_ad",
    UPDATE_AD_USER_NAME: "update_ad_user_name"
  },

  TOPICS: {
    USER_COMMAND: "users_ms_commands",
    USER_EVENT: "users_ms_events",
    USER_AGGREGATE: "users_ms_aggregate",
    REPORT_COMMAND: "reports_ms_commands",
    REPORT_EVENT: "reports_ms_events",
    AD_COMMAND: "ads_ms_commands",
    AD_EVENT: "ads_ms_events",
    PUSH_EVENT: "push_ms_events"
  },

  EVENTS: {
    // User aggregates constants
    USER_CREATED: "user_created",
    USER_UPDATED: "user_updated",
    USER_HOME_UPDATED: "user_home_updated",
    USER_WORK_UPDATED: "user_work_updated",
    USER_ROUTE_CREATED: "user_route_created",
    USER_ROUTE_DELETED: "user_route_deleted",

    // Application aggregate constants
    USER_APPLICATION_CREATED: "user_application_created",
    USER_APPLICATION_APPROVED: "user_application_approved",
    USER_APPLICATION_REJECTED: "user_application_rejected",

    // Report aggregate constants
    REPORT_CREATED: "report_created",
    REPORT_USER_NAME_UPDATED: "report_user_name_updated",
    REPORT_VOTE_CREATED: "report_vote_created",
    REPORT_VOTE_DELETED: "report_vote_deleted",

    // Advertistement aggregate constants
    AD_CREATED: "ad_created",
    AD_USER_NAME_UPDATED: "ad_user_name_updated",

    // Comment aggregate constants
    REPORT_COMMENT_CREATED: "report_comment_created"
  },

  AGGREGATES: {
    USER_AGGREGATE_NAME: "users",
    APPLICATION_AGGREGATE_NAME: "applications",
    REPORT_AGGREGATE_NAME: "reports",
    AD_AGGREGATE_NAME: "advertisements",
    COMMENT_AGGREGATE_NAME: "comments"
  },

  ERRORS: {
    // Errors messages
    DEFAULT_INVALID_DATA: "Invalid data received",
    DEFAULT_SERVER_ERROR: "Something is wrong with the server. Try again later",
    USER_NOT_EXISTS: "This user does not exist",
    DEFAULT_LOGIN_FAILURE: "Login failed",
    PASSWORDS_NOT_MATCH: "Passwords do not match",
    USERNAME_TAKEN: "Username already taken",
    EMAIL_TAKEN: "Email address already registered",
    EMAIL_INVALID_FORMAT: "Format is not a valid email address",
    USER_NOT_PERMITTED: "You don't have the right permissions",
    REPORT_NOT_EXISTS: "This report does not exist",
    INVALID_REPORT_TYPE: "Invalid report type",
    REPORT_TYPE_EMPTY: "No reports of this type",
    AD_NOT_EXISTS: "This ad does not exist",
    COMMENT_NOT_EXISTS: "This comment does not exist",
    COMMENTS_NOT_FOUND: "No comments found",
    APPLICATION_NOT_EXISTS: "Application does not exist",
    DUPLICATE_APPLICATION: "Application already being processed",
    FILE_NOT_FOUND: "File not found",
    COMMAND_NOT_EXISTS: "Command does not exist",
    EVENT_NOT_EXISTS: "Event does not exist"
  },

  SUCCESS: {
    // Success messages
    DEFAULT_SUCCESS: "Success",
    LOGIN_SUCCESS: "Login success"
  },

  // Component names
  COMPONENTS: {
    USER_COMPONENT: "users",
    MAP_COMPONENT: "map"
  }
};
