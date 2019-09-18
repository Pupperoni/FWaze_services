-- Creating Index on reports
CREATE INDEX idx_reports_type ON reports (type);
CREATE SPATIAL INDEX idx_reports_position ON reports (position);

-- Creating Index on comments
CREATE INDEX idx_comments_report_id_timestamp ON comments (report_id, created_at);

