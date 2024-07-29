import { useState } from 'react';

const useModal = () => {
  const [isActive, setIsActive] = useState(false);

  const openModal = () => setIsActive(true);
  const closeModal = () => setIsActive(false);
  const toggleModal = () => setIsActive(!isActive);

  return {
    isActive,
    openModal,
    closeModal,
    toggleModal,
  };
};

export default useModal;
