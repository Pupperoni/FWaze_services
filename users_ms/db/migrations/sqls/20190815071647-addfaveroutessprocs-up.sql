DROP PROCEDURE IF EXISTS CreateFaveRoute;

CREATE PROCEDURE CreateFaveRoute(
    IN routeId VARCHAR(15),
    IN routeName VARCHAR(255),
    IN sourceLat VARCHAR(255),
    IN sourceLng VARCHAR(255),
    IN destLat VARCHAR(255),
    IN destLng VARCHAR(255),
    IN sourceStr VARCHAR(255),
    IN destStr VARCHAR(255),
    IN userId VARCHAR(15)
)
BEGIN
    SET @s = CONCAT("POINT(",sourceLng," ",sourceLat,")");
    SET @d = CONCAT("POINT(",destLng," ",destLat,")");

    INSERT INTO fave_routes (id, name, source_coords, destination_coords, source_string, destination_string, user_id)
    VALUES (routeId, routeName, ST_GeomFromText(@s), ST_GeomFromText(@d), sourceStr, destStr, userId);
END;

DROP PROCEDURE IF EXISTS DeleteFaveRoute;

CREATE PROCEDURE DeleteFaveRoute(
    IN routeId VARCHAR(15)
)
BEGIN
    DELETE FROM fave_routes
    WHERE id = routeId;
END;

DROP PROCEDURE IF EXISTS GetRoutesByUserId;

CREATE PROCEDURE GetRoutesByUserId(
    IN userId VARCHAR(15)
)
BEGIN
    SELECT id, name, source_coords, destination_coords, source_string, destination_string
    FROM fave_routes
    WHERE user_id = userId;
END;

