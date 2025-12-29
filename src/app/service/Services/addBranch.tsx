import React, { useEffect, useState } from "react";
import { Card, Button, Row, Col, Form, FloatingLabel, Badge, Table } from "react-bootstrap";
import { get } from "@/utils/network";

interface Branch {
  id: number;
  name_en: string;
}

interface SelectedBranch {
  branch_id: number;
  name_en: string;
  name_ar: string;
  city_en: string;
  city_ar: string;
  latitude: string;
  longitude: string;
  maximum_booking_per_slot: number;
}

const BranchSelection: React.FC<{
  selectedBranches: SelectedBranch[];
  setSelectedBranches: (branches: SelectedBranch[]) => void;
  title?: string;
}> = ({ selectedBranches, setSelectedBranches, title = "Branch Locations" }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // Pre-fill selected branches if available from props
    const fetchBranches = async () => {
      setLoading(true);
      try {
        const response = await get("/branch");
        setBranches(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Error fetching branches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const addBranchRow = () => {
    setSelectedBranches([...selectedBranches, {
      branch_id: 0, name_en: "", maximum_booking_per_slot: 0,
      name_ar: "",
      city_en: "",
      city_ar: "",
      latitude: "",
      longitude: ""
    }]);
  };

  const handleBranchChange = (index: number, id: string) => {
    const branch = branches.find((b) => b.id === Number(id));
    if (branch) {
      const updatedBranches = [...selectedBranches];
      updatedBranches[index] = { ...updatedBranches[index], branch_id: branch.id, name_en: branch.name_en };
      setSelectedBranches(updatedBranches);
      console.log(updatedBranches)
    }
  };

  const handleTimeSlotsChange = (index: number, value: number) => {
    const updatedBranches = [...selectedBranches];
    updatedBranches[index].maximum_booking_per_slot = value;
    setSelectedBranches(updatedBranches);
  };

  const removeBranch = (index: number) => {
    setSelectedBranches(selectedBranches.filter((_, i) => i !== index));
  };

  // Calculate total time slots
  const calculateTotalTimeSlots = (): number => {
    return selectedBranches.reduce((total, branch) => total + branch.maximum_booking_per_slot, 0);
  };

  return (
    <Card className="border-neutral-200 dark:border-neutral-600">
      <Card.Header className="bg-base d-flex justify-content-between align-items-center py-3 border-bottom border-neutral-200 dark:border-neutral-600">
        <div className="d-flex align-items-center">
          <i className="bi bi-building me-2 text-primary"></i>
          <h4 className="card-title mb-0 text-neutral-900 dark:text-neutral-100">{title}</h4>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={addBranchRow}
          disabled={loading}
          className="d-flex align-items-center"
        >
          <span className="me-1">+</span> Add Branch
        </Button>
      </Card.Header>

      <Card.Body className="p-3 bg-base">
        {loading && (
          <div className="text-center py-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-secondary-light">Loading branches...</p>
          </div>
        )}

        {!loading && selectedBranches.length === 0 ? (
          <div className="text-center py-3 text-secondary-light">
            <i className="bi bi-building fs-4"></i>
            <p className="mt-2">No branches added yet. Click "Add Branch" to begin.</p>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between mb-2">
              <Badge bg="info" className="fs-6 py-1 px-3">
                Total time slots: {calculateTotalTimeSlots()}
              </Badge>
            </div>

            <div className="branches-container">
              {selectedBranches.map((branch, index) => (
                <div key={index} className="mb-2 p-2 bg-neutral-50 dark:bg-neutral-700 rounded border border-neutral-200 dark:border-neutral-600">
                  <Row className="align-items-center g-2">
                    <Col md={5}>
                      <FloatingLabel controlId={`branch-${index}`} label="Branch">
                        <Form.Select
                          value={branch.branch_id}
                          onChange={(e) => handleBranchChange(index, e.target.value)}
                          className={!branch.branch_id ? 'border-danger' : ''}
                        >
                          <option key={-1} value="">Select Branch</option>
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name_en}
                            </option>
                          ))}
                        </Form.Select>
                      </FloatingLabel>
                    </Col>

                    <Col md={4}>
                      <FloatingLabel controlId={`time-slots-${index}`} label="Time Slots">
                        <Form.Control
                          type="number"
                          min="0"
                          value={branch.maximum_booking_per_slot}
                          onChange={(e) => handleTimeSlotsChange(index, Number(e.target.value))}
                        />
                      </FloatingLabel>
                    </Col>

                    <Col md={3} className="d-flex align-items-center justify-content-end">
                      {!branch.branch_id && (
                        <small className="text-danger me-2">Select branch</small>
                      )}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeBranch(index)}
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

export default BranchSelection;