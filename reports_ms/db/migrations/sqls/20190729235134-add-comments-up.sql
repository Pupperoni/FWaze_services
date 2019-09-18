DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` varchar(15) NOT NULL,
  `user_id` varchar(15) NOT NULL,
  `userName` varchar(255) DEFAULT NULL,
  `report_id` varchar(15) DEFAULT NULL,
  `body` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;
