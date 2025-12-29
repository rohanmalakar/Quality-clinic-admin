import React, { useState } from 'react';
import { Form, Button, ListGroup, Badge } from 'react-bootstrap';

interface CityMultiSelectorProps {
  cities: string[];
}

const CityMultiSelector = ({ cities }: CityMultiSelectorProps ) => {
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCityToggle = (city: string) => {
    if (selectedCities.includes(city)) {
      setSelectedCities(selectedCities.filter((c) => c !== city));
    } else {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const handleCityRemove = (city: string) => {
    setSelectedCities(selectedCities.filter((c) => c !== city));
  };

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2>Select Cities</h2>
      <Form.Control
        type="text"
        placeholder="Search cities..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-3"
      />
      <ListGroup className="mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {filteredCities.map((city) => (
          <ListGroup.Item
            key={city}
            action
            active={selectedCities.includes(city)}
            onClick={() => handleCityToggle(city)}
          >
            {city}
          </ListGroup.Item>
        ))}
      </ListGroup>

      <div>
        <h3>Selected Cities:</h3>
        <div className="d-flex flex-wrap">
          {selectedCities.map((city) => (
            <Badge
              key={city}
              pill
              bg="primary"
              className="me-2 mb-2"
              style={{ cursor: 'pointer' }}
              onClick={() => handleCityRemove(city)}
            >
              {city} <span className="ms-1">&#x2715;</span>
            </Badge>
          ))}
          {selectedCities.length === 0 && <p>No cities selected.</p>}
        </div>
      </div>

      <Button variant="primary" onClick={() => console.log(selectedCities)}>
        Submit Selected Cities
      </Button>
    </div>
  );
};

export default CityMultiSelector;