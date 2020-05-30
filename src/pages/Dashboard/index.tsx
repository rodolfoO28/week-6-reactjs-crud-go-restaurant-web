import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const response = await api.get<IFoodPlate[]>('/foods');

      setFoods(response.data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      Object.assign(food, { available: true });
      const response = await api.post<IFoodPlate>('/foods', food);

      const createdFood = response.data;

      setFoods([...foods, createdFood]);
    } catch (err) {
      // eslint-disable-next-line
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const { id, available } = editingFood;

      Object.assign(food, { id, available });

      const response = await api.put<IFoodPlate>(`/foods/${id}`, food);

      const newListFoods = [...foods];
      const foodItem = newListFoods.find(item => item.id === id);

      if (!foodItem) {
        // eslint-disable-next-line
        alert('Food not found.');
        return;
      }
      const updatedFood = response.data;
      const { name, image, price, description } = updatedFood;
      Object.assign(foodItem, { name, image, price, description });

      setFoods(newListFoods);
    } catch (err) {
      // eslint-disable-next-line
      console.log(err);
    }
  }

  async function handleFoodAvailable(id: number): Promise<void> {
    try {
      const newListFoods = [...foods];
      const foodItem = newListFoods.find(item => item.id === id);

      if (!foodItem) {
        // eslint-disable-next-line
        alert('Food not found.');
        return;
      }

      foodItem.available = !foodItem.available;

      await api.put<IFoodPlate>(`/foods/${id}`, foodItem);
    } catch (err) {
      // eslint-disable-next-line
      console.log(err);
    }
  }

  async function handleDeleteFood(id: number): Promise<void> {
    try {
      await api.delete(`/foods/${id}`);

      const newListFoods = foods.filter(item => item.id !== id);

      setFoods(newListFoods);
    } catch (err) {
      // eslint-disable-next-line
      console.log(err);
    }
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    toggleEditModal();
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleFoodAvailable={handleFoodAvailable}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
