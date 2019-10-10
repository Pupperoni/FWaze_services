-- Create table
DROP TABLE IF EXISTS `user_route_history`;
CREATE TABLE `user_route_history` (
    `id` varchar(15) NOT NULL,
    `user_id` varchar(15) NOT NULL,
    `sourceAddress` varchar(255) NOT NULL,
    `sourcePosition` geometry NOT NULL,
    `destinationAddress` varchar(255) NOT NULL,
    `destinationPosition` geometry NOT NULL,
    `created_at` timestamp,
    PRIMARY KEY(`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;

-- Add index
CREATE INDEX idx_user_route_history_userId_created_at ON user_route_history (user_id, created_at);

-- Add sprocs
DROP PROCEDURE IF EXISTS GetRouteHistoryByUserId;
CREATE PROCEDURE GetRouteHistoryByUserId(IN userId VARCHAR(15))
BEGIN
    SELECT * FROM user_route_history
    WHERE user_id = userId
    ORDER BY created_at DESC
    LIMIT 20;
END;

DROP PROCEDURE IF EXISTS CreateRouteHistory;
CREATE PROCEDURE CreateRouteHistory(
    IN routeId VARCHAR(15),
    IN userId VARCHAR(15),
    IN sourceAddress VARCHAR(255),
    IN sourceLatitude VARCHAR(255),
    IN sourceLongitude VARCHAR(255),
    IN destinationAddress VARCHAR(255),
    IN destinationLatitude VARCHAR(255),
    IN destinationLongitude VARCHAR(255),
    IN timenow TIMESTAMP
)
BEGIN
    SET @s = CONCAT("POINT(",sourceLongitude," ",sourceLatitude,")");
    SET @d = CONCAT("POINT(",destinationLongitude," ",destinationLatitude,")");

    INSERT INTO user_route_history (id, user_id, sourceAddress, sourcePosition, destinationAddress, destinationPosition, created_at)
    VALUES (routeId, userId, sourceAddress, ST_GeomFromText(@s), destinationAddress, ST_GeomFromText(@d), timenow);
END;

DROP PROCEDURE IF EXISTS DeleteRouteHistory;
CREATE PROCEDURE DeleteRouteHistory(
    IN routeId VARCHAR(15)
)
BEGIN
    DELETE FROM user_route_history
    WHERE routeId = id;
END;
