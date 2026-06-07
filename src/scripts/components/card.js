const isCardLiked = (likes, userId) => {
  return likes.some((user) => user._id === userId);
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (cardData, userId, handlers) => {
  const { onPreviewPicture, onLikeCard, onDeleteCard } = handlers;
  const cardElement = getTemplate();

  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeCountElement = cardElement.querySelector(".card__like-count");

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;

  likeCountElement.textContent = cardData.likes.length;

  if (isCardLiked(cardData.likes, userId)) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (cardData.owner._id !== userId) {
    deleteButton.remove();
  } else if (onDeleteCard) {
    deleteButton.addEventListener("click", () => {
      onDeleteCard(cardData._id, cardElement);
    });
  }

  if (onLikeCard) {
    likeButton.addEventListener("click", () => {
      const isLiked = likeButton.classList.contains("card__like-button_is-active");
      onLikeCard(cardData._id, isLiked, likeButton, likeCountElement);
    });
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => {
      onPreviewPicture({ name: cardData.name, link: cardData.link });
    });
  }

  return cardElement;
};
