DROP PROCEDURE IF EXISTS CreateComment;

CREATE PROCEDURE CreateComment(
    IN commentId VARCHAR(15),
    IN userId VARCHAR(15),
    IN userName VARCHAR(255),
    IN reportId VARCHAR(15),
    IN comment VARCHAR(255),
    IN timenow TIMESTAMP
)
BEGIN
    INSERT INTO comments (id, user_id, userName, report_id, body, created_at)
    VALUES (commentId, userId, userName, reportId, comment, timenow);
END;

DROP PROCEDURE IF EXISTS GetComments;

CREATE PROCEDURE GetComments()
BEGIN
    SELECT user_id, userName, report_id, body
    FROM comments;
END;

DROP PROCEDURE IF EXISTS GetCommentsByReportId;

CREATE PROCEDURE GetCommentsByReportId(
    IN reportId VARCHAR(15),
    IN pageNum INT
)
BEGIN
    SELECT report_id, user_id, userName, body, created_at
    FROM comments
    WHERE report_id = reportId
    ORDER BY created_at DESC
    LIMIT pageNum, 5;
END;

DROP PROCEDURE IF EXISTS EGetCommentsByReportId;

CREATE PROCEDURE EGetCommentsByReportId(
    IN reportId VARCHAR(15),
    IN pageNum INT
)
BEGIN
    EXPLAIN SELECT report_id, user_id, userName, body
    FROM comments
    WHERE report_id = reportId
    ORDER BY created_at DESC
    LIMIT pageNum, 5;
END;

DROP PROCEDURE IF EXISTS CountCommentsByReportId;

CREATE PROCEDURE CountCommentsByReportId(
    IN reportId VARCHAR(15)
)
BEGIN
    SELECT COUNT(*)
    FROM comments
    WHERE report_id = reportId;
END;

DROP PROCEDURE IF EXISTS GetCommentsByUserId;

CREATE PROCEDURE GetCommentsByUserId(
    IN userName VARCHAR(255)
)
BEGIN
    SELECT user_id, userName, report_id, body
    FROM comments
    WHERE userName = userName;
END;

DROP PROCEDURE IF EXISTS GetCommentById;

CREATE PROCEDURE GetCommentById(
    IN commentId VARCHAR(15)
)
BEGIN
    SELECT user_id, userName, report_id, body
    FROM comments
    WHERE id = commentId;
END;

DROP PROCEDURE IF EXISTS UpdateCommentUserName;

CREATE PROCEDURE UpdateCommentUserName(
    IN userId VARCHAR(15),
    IN userName VARCHAR(255)
)
BEGIN
    UPDATE comments
    SET userName = userName
    WHERE user_id = userId;
END;