-- New posts go public immediately (like Instagram); moderation happens after the fact through
-- reports (auto-hide at auto_hide_report_threshold distinct reporters), blocks, the daily post
-- limit and operator removal. See docs/DECISIONS.md D-049 (supersedes the review-first default of D-018).
-- Set require_review back to true from the dashboard to return to approve-before-publish.
alter table public.community_settings alter column require_review set default false;
update public.community_settings set require_review = false where id;
