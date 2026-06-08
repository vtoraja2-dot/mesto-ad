import "../pages/index.css";
import { createCardElement, deleteCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCard as deleteCardFromServer,
  changeLikeCardStatus,
} from "./components/api.js";
import { updateCardLikeStatus } from './components/card.js';

// Идентификатор текущего пользователя (заполняется после загрузки данных с сервера)
let currentUserId = null;

// Данные карточки для удаления (используется в модальном окне подтверждения)
let cardToDelete = {
  cardId: null,
  cardElement: null,
};

// DOM-элементы списка карточек
const placesWrap = document.querySelector(".places__list");

// DOM-элементы профиля
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");
const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

// DOM-элементы модального окна редактирования профиля
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");
const profileFormSubmitButton = profileForm.querySelector(".popup__button");

// DOM-элементы модального окна добавления карточки
const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const cardFormSubmitButton = cardForm.querySelector(".popup__button");

// DOM-элементы модального окна просмотра изображения
const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

// DOM-элементы модального окна обновления аватара
const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const avatarFormSubmitButton = avatarForm.querySelector(".popup__button");

// DOM-элементы модального окна подтверждения удаления карточки
const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");
const removeCardSubmitButton = removeCardForm.querySelector(".popup__button");

// DOM-элементы модального окна статистики пользователей
const usersStatsModalWindow = document.querySelector(".popup_type_info");
const usersStatsModalTitle = usersStatsModalWindow.querySelector(".popup__title");
const usersStatsModalInfoList = usersStatsModalWindow.querySelector(".popup__info");
const usersStatsModalText = usersStatsModalWindow.querySelector(".popup__text");
const usersStatsModalList = usersStatsModalWindow.querySelector(".popup__list");

// DOM-элемент логотипа (для открытия статистики)
const logoElement = document.querySelector(".logo");

// Настройки валидации форм
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const renderLoading = (button, isLoading, defaultText = "Сохранить", loadingText = "Сохранение...") => {
  button.textContent = isLoading ? loadingText : defaultText;
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const template = document.getElementById("popup-info-definition-template");
  const element = template.content.querySelector(".popup__info-item").cloneNode(true);
  element.querySelector(".popup__info-term").textContent = term;
  element.querySelector(".popup__info-description").textContent = description;
  return element;
};

const createUserPreview = (userName) => {
  const template = document.getElementById("popup-info-user-preview-template");
  const element = template.content.querySelector(".popup__list-item").cloneNode(true);
  element.textContent = userName;
  return element;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleLikeCard = (cardId, isLiked, cardElement) => {
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      updateCardLikeStatus(cardElement, updatedCard.liked, updatedCard.likes.length);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleDeleteCardClick = (cardId, cardElement) => {
  cardToDelete.cardId = cardId;
  cardToDelete.cardElement = cardElement;
  openModalWindow(removeCardModalWindow);
};

const handleConfirmDelete = (evt) => {
  evt.preventDefault();
  renderLoading(removeCardSubmitButton, true, "Да", "Удаление...");

  deleteCardFromServer(cardToDelete.cardId)
    .then(() => {
      deleteCard(cardToDelete.cardElement);
      closeModalWindow(removeCardModalWindow);
      cardToDelete = { cardId: null, cardElement: null };
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(removeCardSubmitButton, false, "Да", "Удаление...");
    });
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(profileFormSubmitButton, true);

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(profileFormSubmitButton, false);
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(avatarFormSubmitButton, true);

  setUserAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(avatarFormSubmitButton, false);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(cardFormSubmitButton, true, "Создать", "Создание...");

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((newCard) => {
      placesWrap.prepend(
        createCardElement(newCard, currentUserId, {
          onPreviewPicture: handlePreviewPicture,
          onLikeCard: handleLikeCard,
          onDeleteCard: handleDeleteCardClick,
        })
      );
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(cardFormSubmitButton, false, "Создать", "Создание...");
    });
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      usersStatsModalInfoList.innerHTML = "";
      usersStatsModalList.innerHTML = "";

      usersStatsModalTitle.textContent = "Статистика пользователей";

      usersStatsModalInfoList.append(
        createInfoString("Всего карточек:", cards.length.toString())
      );

      if (cards.length > 0) {
        usersStatsModalInfoList.append(
          createInfoString(
            "Первая создана:",
            formatDate(new Date(cards[cards.length - 1].createdAt))
          )
        );
        usersStatsModalInfoList.append(
          createInfoString(
            "Последняя создана:",
            formatDate(new Date(cards[0].createdAt))
          )
        );

        const userCardCounts = {};
        cards.forEach((card) => {
          const ownerId = card.owner._id;
          if (!userCardCounts[ownerId]) {
            userCardCounts[ownerId] = {
              count: 0,
              name: card.owner.name,
            };
          }
          userCardCounts[ownerId].count++;
        });

        const allUsers = Object.values(userCardCounts);
        const maxCards = Math.max(...allUsers.map((u) => u.count));

        usersStatsModalInfoList.append(
          createInfoString("Всего пользователей:", allUsers.length.toString())
        );
        usersStatsModalInfoList.append(
          createInfoString("Максимум карточек от одного:", maxCards.toString())
        );

        usersStatsModalText.textContent = "Все пользователи:";
        allUsers.forEach((user) => {
          usersStatsModalList.append(createUserPreview(user.name));
        });
      } else {
        usersStatsModalText.textContent = "";
      }

      openModalWindow(usersStatsModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

// Установка обработчиков событий для форм
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
removeCardForm.addEventListener("submit", handleConfirmDelete);

// Обработчик открытия модального окна редактирования профиля
openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

// Обработчик открытия модального окна обновления аватара
profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

// Обработчик открытия модального окна добавления карточки
openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

// Обработчик клика по логотипу для открытия статистики
logoElement.addEventListener("click", handleLogoClick);

// Настройка обработчиков закрытия для всех модальных окон
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// Включение валидации для всех форм
enableValidation(validationSettings);

Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(cardData, currentUserId, {
          onPreviewPicture: handlePreviewPicture,
          onLikeCard: handleLikeCard,
          onDeleteCard: handleDeleteCardClick,
        })
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });
