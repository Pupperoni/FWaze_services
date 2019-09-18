DROP PROCEDURE IF EXISTS GetAllAds;

CREATE PROCEDURE GetAllAds()
BEGIN
    SELECT id, position
    FROM advertisements;
END;

DROP PROCEDURE IF EXISTS CreateAd;

CREATE PROCEDURE CreateAd(
    IN adId VARCHAR(15),
    IN adLongitude VARCHAR(255),
    IN adLatitude VARCHAR(255)
)
BEGIN
    SET @g = CONCAT("POINT(",adLongitude," ",adLatitude,")");
    INSERT INTO advertisements (id, position)
    VALUES (adId, ST_GeomFromText(@g));
END;

DROP PROCEDURE IF EXISTS GetAdById;

CREATE PROCEDURE GetAdById(IN adId VARCHAR(15))
BEGIN
    SELECT id, position
    FROM advertisements;
END;

DROP PROCEDURE IF EXISTS GetAdsByBorder;

CREATE PROCEDURE GetAdsByBorder(
    IN xl VARCHAR(255),
    IN xu VARCHAR(255),
    IN yl VARCHAR(255),
    IN yu VARCHAR(255)
)
BEGIN
    SET @g = CONCAT("POLYGON((",xl," ",yl,", ",xu," ",yl,", ",xu," ",yu,", ",xl," ",yu,", ",xl," ",yl,"))");
    SELECT id, position
    FROM advertisements
    WHERE ST_Contains(ST_GeomFromText(@g), position);
END;

DROP PROCEDURE IF EXISTS EGetAdsByBorder;

CREATE PROCEDURE EGetAdsByBorder(
    IN xl VARCHAR(255),
    IN xu VARCHAR(255),
    IN yl VARCHAR(255),
    IN yu VARCHAR(255)
)
BEGIN
    SET @g = CONCAT("POLYGON((",xl," ",yl,", ",xu," ",yl,", ",xu," ",yu,", ",xl," ",yu,", ",xl," ",yl,"))");
    EXPLAIN SELECT id, position
    FROM advertisements
    WHERE ST_Contains(ST_GeomFromText(@g), position);
END;
