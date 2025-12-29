import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Form, FloatingLabel, Badge } from 'react-bootstrap';
import moment from 'moment';
import { TimeRange } from '@/utils/types';

interface TimeSlotCreatorProps {
  selectedTimeSlots:TimeRange[]
  title: string;
  setSelectedTimeSlots: (timeRanges: TimeRange[]) => void;
}

const TimeSlotCreator: React.FC<TimeSlotCreatorProps> = ({ 
  title = "Schedule Availability", 
  selectedTimeSlots,
  setSelectedTimeSlots 
}) => {
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([
    { start_time: '09:00:00', end_time: '10:00:00' }
  ]);

  useEffect(() => {
    console.log(selectedTimeSlots)
    createTimeOptions();
  }, [selectedTimeSlots]);

  const handleAddTimeRange = () => {
    setSelectedTimeSlots([...selectedTimeSlots, { start_time: '09:00:00', end_time: '10:00:00' }]);
  };

  const handleRemoveTimeRange = (index: number) => {
    const updatedTimeRanges = [...selectedTimeSlots];
    updatedTimeRanges.splice(index, 1);
    setSelectedTimeSlots(updatedTimeRanges);
  };

  const handleStartTimeChange = (index: number, value: string) => {
    const updatedTimeRanges = [...selectedTimeSlots];
    updatedTimeRanges[index].start_time = value;
    setSelectedTimeSlots(updatedTimeRanges);
  };

  const handleEndTimeChange = (index: number, value: string) => {
    const updatedTimeRanges = [...selectedTimeSlots];
    updatedTimeRanges[index].end_time = value;
    setSelectedTimeSlots(updatedTimeRanges);
  };

  const createTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeValue = moment().hour(hour).minute(minute).second(0).format('HH:mm:ss');
        const timeLabel = moment().hour(hour).minute(minute).format('h:mm A');
        options.push(
          <option key={timeValue} value={timeValue}>
            {timeLabel}
          </option>
        );
      }
    }
    return options;
  };

  // Calculate total hours scheduled
  const calculateTotalHours = (): string => {
    let totalMinutes = 0;
    
    timeRanges.forEach(range => {
      const startMoment = moment(range.start_time, 'HH:mm:ss');
      const endMoment = moment(range.end_time, 'HH:mm:ss');
      
      if (endMoment.isAfter(startMoment)) {
        const duration = moment.duration(endMoment.diff(startMoment));
        totalMinutes += duration.asMinutes();
      }
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  };

  const isValidTimeRange = (range: TimeRange): boolean => {
    return moment(range.end_time, 'HH:mm:ss').isAfter(moment(range.start_time, 'HH:mm:ss'));
  };

  return (
    <Card className="border-neutral-200 dark:border-neutral-600">
      <Card.Header className="bg-base d-flex justify-content-between align-items-center py-3 border-bottom border-neutral-200 dark:border-neutral-600">
        <div className="d-flex align-items-center">
          <i className="bi bi-clock me-2 text-primary"></i>
          <h4 className="card-title mb-0 text-neutral-900 dark:text-neutral-100">{title}</h4>
        </div>
        <Button 
          variant="primary" 
          size="sm"
          onClick={handleAddTimeRange}
          className="d-flex align-items-center"
        >
          <span className="me-1">+</span> Add Time Slot
        </Button>
      </Card.Header>
      
      <Card.Body className="p-3 bg-base">
        {timeRanges.length === 0 ? (
          <div className="text-center py-3 text-secondary-light">
            <i className="bi bi-clock fs-4"></i>
            <p className="mt-2">No time slots added yet. Click "Add Time Slot" to begin.</p>
          </div>
        ) : (
          <>
          {/* Total time calcualtor commented for now as not working */}
            {/* <div className="d-flex justify-content-between mb-2">
              <Badge bg="info" className="fs-6 py-1 px-3">
                Total scheduled: {calculateTotalHours()}
              </Badge>
            </div> */}
            
            <div className="time-slots-container">
              {selectedTimeSlots.map((range, index) => (
                <div key={index} className={`rounded ${!isValidTimeRange(range) ? 'border-danger' : 'border-neutral-200 dark:border-neutral-600'} mb-2 p-2 bg-neutral-50 dark:bg-neutral-700`}>
                  <Row className="align-items-center g-2">
                    <Col md={4}>
                      <FloatingLabel controlId={`start-time-${index}`} label="Start Time">
                        <Form.Select
                          value={range.start_time}
                          onChange={(e) => handleStartTimeChange(index, e.target.value)}
                          className={!isValidTimeRange(range) ? 'border-danger' : ''}
                        >
                          {createTimeOptions()}
                        </Form.Select>
                      </FloatingLabel>
                    </Col>

                    <Col md={4}>
                      <FloatingLabel controlId={`end-time-${index}`} label="End Time">
                        <Form.Select
                          value={range.end_time}
                          onChange={(e) => handleEndTimeChange(index, e.target.value)}
                          className={!isValidTimeRange(range) ? 'border-danger' : ''}
                        >
                          {createTimeOptions()}
                        </Form.Select>
                      </FloatingLabel>
                    </Col>

                    <Col md={4} className="d-flex align-items-center justify-content-end">
                      {!isValidTimeRange(range) && (
                        <small className="text-danger me-2">Invalid time</small>
                      )}
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleRemoveTimeRange(index)}
                     
                      >
                        Remove
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          </>
        )}
      </Card.Body>
    
      
    </Card>
  );
};

export default TimeSlotCreator;