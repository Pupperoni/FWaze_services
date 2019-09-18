DROP PROCEDURE IF EXISTS GetAllUsers;

CREATE PROCEDURE GetAllUsers()
BEGIN
    SELECT id, name, email, home, work
    FROM users;
END;

DROP PROCEDURE IF EXISTS GetUserById;

CREATE PROCEDURE GetUserById(IN userId VARCHAR(15))
BEGIN
    SELECT id, name, email, home, work
    FROM users
    WHERE id = userId;
END;

DROP PROCEDURE IF EXISTS GetUserByName;

CREATE PROCEDURE GetUserByName(IN userName VARCHAR(255))
BEGIN
    SELECT id, name, email, home, work
    FROM users
    WHERE name = userName;
END;

DROP PROCEDURE IF EXISTS GetUserByEmail;

CREATE PROCEDURE GetUserByEmail(IN userEmail VARCHAR(255))
BEGIN
    SELECT id, name, email, home, work
    FROM users
    WHERE email = userEmail;
END;

DROP PROCEDURE IF EXISTS CreateUser;

CREATE PROCEDURE CreateUser(
    IN userId VARCHAR(15),
    IN userName VARCHAR(255),
    IN userEmail VARCHAR (255),
    IN userPassword VARCHAR (255)
)
BEGIN
    INSERT INTO users (id, name, email, password)
    VALUES (userId, userName, userEmail, userPassword);
END;

DROP PROCEDURE IF EXISTS SetHomeAd;

CREATE PROCEDURE SetHomeAd(
    IN userId VARCHAR(15),
    IN addr VARCHAR(255)
)
BEGIN
    UPDATE users SET home = addr
    WHERE id = userId;
END;

DROP PROCEDURE IF EXISTS SetWorkAd;

CREATE PROCEDURE SetWorkAd(
    IN userId VARCHAR(15),
    IN addr VARCHAR(255)
)
BEGIN
    UPDATE users SET work = addr
    WHERE id = userId;
END;

DROP PROCEDURE IF EXISTS UpdateUser;

CREATE PROCEDURE UpdateUser(
    IN userName VARCHAR(255), 
    IN userEmail VARCHAR(255),
    IN userID VARCHAR(15)
)
BEGIN
    UPDATE users SET name = userName, email = userEmail
    WHERE id = userId;
END;