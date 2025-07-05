SELECT 
  n.id,
  n.title,
  n.content,
  n.isPinned,
  n.isArchived,
  n.workspaceId,
  n.createdAt,
  n.updatedAt,
  u.name as author_name
FROM notes n
JOIN users u ON n.authorId = u.id
ORDER BY n.updatedAt DESC
LIMIT 10;