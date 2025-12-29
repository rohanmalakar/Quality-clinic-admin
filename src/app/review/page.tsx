'use client'

import { AppDispatch, RootState } from '@/store';
import { get, post } from '@/utils/network';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setError, setReviews } from './store';
import {Review as ReviewType} from './state';
import { Modal } from 'react-bootstrap';
import { Icon } from '@iconify/react/dist/iconify.js';

const ReviewPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { state, error, reviews  } = useSelector((state: RootState) => state.review);
  
  useEffect(() => {
    // fetch all the reviews to be shown
    if (state === 'INITIALIZED') return;
    const fetchReviews = async () => {
      try {
        const reviews = await get('/review');
        dispatch(setReviews(reviews));
      } catch(e) {
        console.error(e);
        dispatch(setError('Failed to fetch reviews'));
      }
    }
    fetchReviews();
  }, []);

  if (state === 'LOADING') {
    return (
      <div className='d-flex align-items-center justify-content-center h-100'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    );
  }
  if (state === 'ERROR') {
    return (
      <div className='d-flex align-items-center justify-content-center h-100'>
        <div className='text-danger'>{error}</div>
      </div>
    );
  }
  return (
    <div className='row g-12'>
      {reviews.map((review) => (
        <Review key={review.id} review={review} />
      ))}
    </div>
    );
};

interface ReviewProps {
  review: ReviewType; // Adjust the type according to your actual review type
}

const Review: React.FC<ReviewProps> = ({ review }) => {
  
  const [commentModelOpen, setCommentModelOpen] = React.useState(false);
  const [comment, setComment] = React.useState('');
  const [commentState, setCommentState] = React.useState('LOADING');

  const fetchComment = async () => {
    try {
      const comment = await get(`/review/comment/${review.id}`);
      if (!comment) {
        setCommentState('UNINITIALIZED');
        return;
      }
      setComment(comment.comment);
      setCommentState('INITIALIZED');
    } catch(e) {
      console.error(e);
      setCommentState('ERROR');
    }
  }

  const createComment = async () => {
    try {
      setCommentState('LOADING');
      let commentLocal = comment.trim();
      if (!commentLocal) {
        return;
      }
      await post(`/review/comment`, { comment, review_id: review.id });
      fetchComment();
    } catch(e) {
      console.error(e);
    }
  }

  const openModel = () => {
    setCommentModelOpen(true);
    if (commentState === 'LOADING') {
      fetchComment();
    }
  }


  return (
  <>
    <Modal
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      show={commentModelOpen}
      onHide={() => setCommentModelOpen(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Comment Review
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>{review.user_name}</h4>
        <p>
         {review.review}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Comment 
        state={commentState}
        comment={comment}
        setComment={(comment: string) => setComment(comment)}
        createComment={() => createComment()}  />
      </Modal.Footer>
    </Modal>
    <div className='col-xxl-4 col-md-6 mt-16' onClick={openModel}>
      <div className='card rounded-3 overflow-hidden h-100'>
        <div className='card-body p-24'>
          <div className='d-flex align-items-start justify-content-between gap-2'>
            <div className='d-flex align-items-center gap-12 flex-wrap'>
              <div className='w-56-px h-56-px overflow-hidden flex-shrink-0'>
                <img
                  src='assets/images/user-list/user-list1.png'
                  alt=''
                  className='w-100 h-100 object-fit-cover rounded-circle'
                />
              </div>
              <div className='d-flex flex-column flex-grow-1'>
                <h6 className='text-xl mb-0'>{review.user_name}</h6>
                <span className='text-neutral-500'>{review.name_en} ({review.booking_type})</span>
              </div>
            </div>
            <RenderStarRating rating={review.rating} />
          </div>
          <p className='mt-24 text-neutral-500 text-lg mb-0'>
            {review.review}
          </p>
        </div>
      </div>
    </div>
  </>
  )
}

type CommentProps = {
  state: string;
  comment: string;
  setComment: (comment: string) => void;
  createComment: () => void;
}

const Comment: React.FC<CommentProps> = ({ state, comment, setComment, createComment }) => {
  if (state === 'LOADING') {
    return (
      <div className='d-flex align-items-center justify-content-center h-100'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    );
  }
  if (state === 'ERROR') {
    return (
      <div className='d-flex align-items-center justify-content-center h-100'>
        <div className='text-danger'>Failed to fetch comments</div>
      </div>
    );
  }
  if (state == 'UNINITIALIZED') {
    return(<div className='chat-message-box'>
        <input type='text' name='chatMessage' onChange={(e) => setComment(e.target.value)
        }  placeholder='Write Comment' />
      <div className='chat-message-box-action'>
        <button
          onClick={createComment}
          className='btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1'
        >
          Send
          <Icon icon='f7:paperplane' />
        </button>
      </div>
    </div>
    )
  }
  return (
    <p>Admin Comment: <b>{comment}</b></p>
  )
}

const RenderStarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <li key= {i} className={`text-warning-600`}>
        <i className={`ri-star-${i <= rating ? 'fill' : 'line'}`} />
      </li>
    );
  }
  return <ul className='d-flex align-items-center justify-content-end gap-1'>{stars}</ul>;
}

export default ReviewPage;