// src/components/posts/CommentItem.jsx

import React from 'react';

const CommentItem = ({ comment }) => {
    return (
        <div className="comment-item">
            <img
                src={comment.authorId?.avatarUrl || '/default-avatar.png'}
                alt={comment.authorId?.alias}
                className="comment-author-avatar"
            />
            <div className="comment-body">
                <span className="comment-author-alias">{comment.authorId?.alias}</span>
                <p className="comment-content">{comment.content}</p>
                <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    );
};

export default CommentItem;