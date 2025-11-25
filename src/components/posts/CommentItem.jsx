// src/components/posts/CommentItem.jsx

import React from 'react';

const DefaultAvatar = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="40px" height="40px" style={{ color: '#cccccc' }}>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
);

const CommentItem = ({ comment }) => {
    return (
        <div className="comment-item">
            {comment.authorId?.avatarUrl ? (
                <img
                    src={comment.authorId.avatarUrl}
                    alt={comment.authorId.alias}
                    className="comment-author-avatar"
                />
            ) : (
                <div className="comment-author-avatar">
                    <DefaultAvatar />
                </div>
            )}
            <div className="comment-body">
                <span className="comment-author-alias">{comment.authorId?.alias}</span>
                <p className="comment-content">{comment.content}</p>
                <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    );
};

export default CommentItem;