# Supporta

[![Postman](https://img.shields.io/badge/Postman-API-orange)](https://documenter.getpostman.com/view/25121510/2sB3HqKKV4)
[![React](https://img.shields.io/badge/React-17.0.2-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green)](https://nodejs.org/)
[![Version](https://img.shields.io/badge/version-1.0.0-purple)]()

Supporta is an AI-powered chatbot platform that allows businesses to provide intelligent conversational experiences. Users can upload business information, and the chatbot responds accurately using the provided data.

---

## Table of Contents

* [Features](#features)
* [Tech Stack](#tech-stack)
* [Installation](#installation)
* [Configuration](#configuration)
* [Usage](#usage)
* [API Endpoints](#api-endpoints)
* [Postman Documentation](#postman-documentation)
* [Contributing](#contributing)
* [License](#license)

---

## Features

* AI chatbot for business-specific queries
* Upload business information (PDFs, text, images)
* Session-based conversations
* Markdown rendering for rich text responses
* Image support in messages
* Chat history with expandable sessions
* Sorting and filtering of conversation history

---

## Tech Stack

* **Frontend:** React, Material-UI, React Markdown
* **Backend:** Node.js, Express, MongoDB
* **Cloud Storage:** Backblaze B2 for images and assets
* **Authentication:** Custom API token (`widgetToken`)

---

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/anitaki/supporta.git
cd supporta
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

Create a `.env` file in the root directory:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
B2_KEY_ID=your_backblaze_key_id
B2_APP_KEY=your_backblaze_app_key
```

4. **Run the application**

```bash
npm run dev
```

---

## Configuration

* **Widget Token:** Fetch the widget token from the backend `/business` endpoint. This token is required to access chat messages securely.
* **Storage:** Images uploaded to Backblaze B2 are accessible via URLs in messages.

---

## Usage

### Frontend

* Navigate to the chat interface.
* Upload your business data for the chatbot.
* Start a conversation and view responses.

### Chat History

* View past conversations in an accordion-style list.
* Sort sessions by newest or oldest first.
* Expand sessions to see full messages, including Markdown and images.

---

## API Endpoints

### GET /business

Fetch widget token for the current business.

**Response:**

```json
{
  "widgetToken": "your_widget_token"
}
```

### GET /message/all

Fetch all messages for the business.

**Headers:**

```
x-widget-token: <widgetToken>
```

**Response:**

```json
[
  {
    "conversationId": "uuid",
    "messages": [
      {
        "_id": "message_id",
        "role": "user",
        "content": "User's message",
        "timestamp": "2025-11-30T19:45:50.000Z"
      },
      {
        "_id": "message_id",
        "role": "assistant",
        "content": "AI response",
        "timestamp": "2025-11-30T19:46:00.000Z"
      }
    ]
  }
]
```

---

## Postman Documentation

The full API can be explored in Postman:

[Supporta Postman Collection](https://documenter.getpostman.com/view/25121510/2sB3HqKKV4)

---

## License

This project is licensed under the MIT License.
