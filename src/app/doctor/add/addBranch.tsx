import React, { useEffect, useState } from "react";
import { Card, Button, Row, Col, Form, FloatingLabel, Badge } from "react-bootstrap";
import { get } from "@/utils/network";
import { SelectedBranch } from "@/utils/types";

interface Branch {
  id: number;
  name_en: string;
  availableDays: number[];
}

const BranchSelection: React.FC<{
  selectedBranches: SelectedBranch[];
  setSelectedBranches: (branches: SelectedBranch[]) => void;
  title?: string;
}> = ({ selectedBranches, setSelectedBranches, title = "Branch Locations" }) => {
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<SelectedBranch[]>([]);

  useEffect(() => {
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
    setSelectedBranches([...selectedBranches, { id: 0, name_en: "", availableDays: [] }]);
  };

  const handleBranchChange = (index: number, id: string) => {
    const branch = branches.find((b) => b.id === Number(id));
    if (branch) {
      const updatedBranches = [...selectedBranches];
      updatedBranches[index] = { ...updatedBranches[index], id: branch.id, name_en: branch.name_en, availableDays: [] };
      setSelectedBranches(updatedBranches);
    }
  };

  const handleDaySelection = (index: number, day: number, isChecked: boolean) => {
    const updatedBranches = selectedBranches.map((branch, i) =>
      i === index
        ? {
            ...branch,
            availableDays: isChecked
              ? [...branch.availableDays, day]
              : branch.availableDays.filter((d) => d !== day),
          }
        : branch
    );
    setSelectedBranches(updatedBranches);
  };

  const removeBranch = (index: number) => {
    setSelectedBranches(selectedBranches.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
        <div className="d-flex align-items-center">
          <i className="bi bi-building me-2 text-primary"></i>
          <h4 className="card-title mb-0" style={{ color: "#666666" }}>{title}</h4>
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

      <Card.Body className="p-3">
        {loading && (
          <div className="text-center py-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading branches...</p>
          </div>
        )}

        {!loading && selectedBranches.length === 0 ? (
          <div className="text-center py-3 text-muted">
            <i className="bi bi-building fs-4"></i>
            <p className="mt-2">No branches added yet. Click "Add Branch" to begin.</p>
          </div>
        ) : (
          <div className="branches-container">
            {selectedBranches.map((branch, index) => (
              <div key={index} className="mb-2 p-2 bg-white">
                <Row className="align-items-center g-2">
                  <Col md={5}>
                    <FloatingLabel controlId={`branch-${index}`} label="Branch">
                      <Form.Select
                        onClick={(e) => console.log(branch)}
                        value={branch.id}
                        onChange={(e) => handleBranchChange(index, e.target.value)}
                        className={!branch.id ? "border-danger" : ""}
                      >
                        <option key={0} value={0}>Select Branch</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name_en}
                          </option>
                        ))}
                      </Form.Select>
                    </FloatingLabel>
                  </Col>

                  <Col md={5}>
                 
                  <Form.Group controlId={`available-days-${index}`} className="mb-3 d-flex justify-content-center align-items-center">
                    <div className="d-flex flex-wrap gap-1 justify-content-center align-items-center">
                      {["M", "T", "W", "T", "F", "S", "S"].map((shortDay, dayIndex) => {
                        const fullDay = [1,2,3,4,5,6,7][dayIndex];
                        const isSelected = branch.availableDays?.includes(fullDay);
                        
                        return (
                          <Button 
                            key={fullDay}
                            variant={isSelected ? "primary" : "outline-secondary"}
                            size="sm"
                            onClick={() => handleDaySelection(index, fullDay, !isSelected)}
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: "32px", height: "32px", padding: "0" }}
                          >
                            {shortDay}
                          </Button>    
                            );
                          })}
                    </div>
                  </Form.Group>
                  </Col>

                  <Col md={2} className="d-flex align-items-center justify-content-end">
                    {!branch.id && <small className="text-danger me-2">Select branch</small>}
                    <Button variant="outline-danger" size="sm" onClick={() => removeBranch(index)}>
                      Remove
                    </Button>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default BranchSelection;
