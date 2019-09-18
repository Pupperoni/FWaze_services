DROP PROCEDURE IF EXISTS GetAllReports;

CREATE PROCEDURE GetAllReports()
BEGIN
    SELECT id, type, position
    FROM reports;
END;

DROP PROCEDURE IF EXISTS GetReportById;

CREATE PROCEDURE GetReportById(IN reportId VARCHAR(15))
BEGIN
    SELECT id, type, position
    FROM reports
    WHERE id = reportId;
END;

DROP PROCEDURE IF EXISTS CreateReport;

CREATE PROCEDURE CreateReport(
    IN reportId VARCHAR(15),
    IN reportType INT(11),
    IN reportLongitude VARCHAR(255),
    IN reportLatitude VARCHAR(255)
)
BEGIN
    SET @g = CONCAT("POINT(",reportLongitude," ",reportLatitude,")");
    INSERT INTO reports (id, `type`, position)
    VALUES (reportId, reportType, ST_GeomFromText(@g));
END;

DROP PROCEDURE IF EXISTS AddVote;

CREATE PROCEDURE AddVote(
    IN reportId VARCHAR(15),
    IN userId VARCHAR(15)
)
BEGIN
    INSERT INTO upvotes (report_id,`user_id`)
    VALUES (reportId, userId);
END;

DROP PROCEDURE IF EXISTS RemoveVote;

CREATE PROCEDURE RemoveVote(
    IN reportId VARCHAR(15),
    IN userId VARCHAR(15)
)
BEGIN
    DELETE
    FROM upvotes
    WHERE report_id = reportId and `user_id` = userId;
END;

DROP PROCEDURE IF EXISTS GetUserVotePair;

CREATE PROCEDURE GetUserVotePair(
    IN reportId VARCHAR(15),
    IN userId VARCHAR(15)
)
BEGIN
    SELECT report_id, user_id
    FROM upvotes
    WHERE report_id = reportId and `user_id` = userId;
END;

DROP PROCEDURE IF EXISTS GetReportsByType;

CREATE PROCEDURE GetReportsByType(IN reportType INT(11))
BEGIN
    SELECT id, type, position
    FROM reports
    WHERE `type` = reportType;
END;

DROP PROCEDURE IF EXISTS GetReportsByBorder;

CREATE PROCEDURE GetReportsByBorder(
    IN xl VARCHAR(255),
    IN xu VARCHAR(255),
    IN yl VARCHAR(255),
    IN yu VARCHAR(255)
)
BEGIN
    SET @g = CONCAT("POLYGON((",xl," ",yl,", ",xu," ",yl,", ",xu," ",yu,", ",xl," ",yu,", ",xl," ",yl,"))");
    SELECT id, type, position
    FROM reports
    WHERE ST_Contains(ST_GeomFromText(@g), position);
END;

DROP PROCEDURE IF EXISTS EGetReportsByBorder;

CREATE PROCEDURE EGetReportsByBorder(
    IN xl VARCHAR(255),
    IN xu VARCHAR(255),
    IN yl VARCHAR(255),
    IN yu VARCHAR(255)
)
BEGIN
    SET @g = CONCAT("POLYGON((",xl," ",yl,", ",xu," ",yl,", ",xu," ",yu,", ",xl," ",yu,", ",xl," ",yl,"))");
    EXPLAIN SELECT id, type, position
    FROM reports
    WHERE ST_Contains(ST_GeomFromText(@g), position);
END;

DROP PROCEDURE IF EXISTS GetReportsByTypeBorder;

CREATE PROCEDURE GetReportsByTypeBorder(
    IN reportType INT(11),
    IN xl VARCHAR(255),
    IN xu VARCHAR(255),
    IN yl VARCHAR(255),
    IN yu VARCHAR(255)
)
BEGIN
    SET @g = CONCAT("POLYGON((",xl," ",yl,", ",xu," ",yl,", ",xu," ",yu,", ",xl," ",yu,", ",xl," ",yl,"))");
    SELECT id, type, position
    FROM reports
    WHERE `type` = reportType and ST_Contains(ST_GeomFromText(@g), position);
END;

DROP PROCEDURE IF EXISTS EGetReportsByTypeBorder;

CREATE PROCEDURE EGetReportsByTypeBorder(
    IN reportType INT(11),
    IN xl VARCHAR(255),
    IN xu VARCHAR(255),
    IN yl VARCHAR(255),
    IN yu VARCHAR(255)
)
BEGIN
    SET @g = CONCAT("POLYGON((",xl," ",yl,", ",xu," ",yl,", ",xu," ",yu,", ",xl," ",yu,", ",xl," ",yl,"))");
    EXPLAIN SELECT id, type, position
    FROM reports
    WHERE `type` = reportType and ST_Contains(ST_GeomFromText(@g), position);
END;