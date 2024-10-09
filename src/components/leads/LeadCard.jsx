import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import './LeadCard.css';

function LeadCard({ card, columnId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [{ isDragging }, drag] = useDrag({
    type: 'card',
    item: { id: card.id, columnId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={`lead-card ${isDragging ? 'dragging' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <h3>{card.title}</h3>
      <div className="tags">
        {card.tags.map((tag, index) => (
          <span key={index} className="tag">{tag}</span>
        ))}
      </div>
      {isExpanded && (
        <div className="card-details">
          <p>Amount: ${card.amount}</p>
          <p>Company: {card.company}</p>
        </div>
      )}
    </div>
  );
}

export default LeadCard;