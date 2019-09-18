DROP TABLE IF EXISTS `upvotes`;
CREATE TABLE `upvotes` (
    `report_id` varchar(15) NOT NULL,
    `user_id` varchar(15) NOT NULL,
    PRIMARY KEY (`report_id`, `user_id`)
) 