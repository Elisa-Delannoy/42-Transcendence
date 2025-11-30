// ---- REGISTER ----
export const registerSchema = {
    body: {
      type: "object",
      required: ["pseudo", "email", "password", "confirm"],
      additionalProperties: false,
      properties: {
        pseudo: {
          type: "string",
          minLength: 1,
          maxLength: 16,
          pattern: "^[a-zA-Z0-9_]+$"
        },
        email: {
          type: "string",
          format: "email",
          maxLength: 255
        },
        password: {
          type: "string",
          minLength: 6,
          maxLength: 32
        },
        confirm: {
          type: "string",
          minLength: 6,
          maxLength: 32
        }
      }
    }
};
  
// ---- LOGIN ----
export const loginSchema = {
    body: {
      type: "object",
      required: ["pseudo", "password"],
      additionalProperties: false,
      properties: {
        pseudo: {
          type: "string",
          minLength: 1,
          maxLength: 16,
          pattern: "^[a-zA-Z0-9_]+$"
        },
        password: {
          type: "string",
          minLength: 1,
          maxLength: 72
        }
      }
    }
};
  
// ---- UPDATE USERNAME ----
export const updateUsernameSchema = {
    body: {
      type: "object",
      required: ["newUsername", "password"],
      additionalProperties: false,
      properties: {
        newUsername: {
          type: "string",
          minLength: 1,
          maxLength: 16,
          pattern: "^[a-zA-Z0-9_]+$"
        },
        password: {
          type: "string",
          minLength: 1,
          maxLength: 72
        }
      }
    }
};
  
// ---- UPDATE EMAIL ----
export const updateEmailSchema = {
    body: {
      type: "object",
      required: ["newEmail", "password"],
      additionalProperties: false,
      properties: {
        newEmail: { type: "string", format: "email", maxLength: 255 },
        password: { type: "string", minLength: 1, maxLength: 72 }
      }
    }
};
  
// ---- UPDATE PASSWORD ----
export const updatePasswordSchema = {
    body: {
      type: "object",
      required: ["oldPw", "newPw", "confirm"],
      additionalProperties: false,
      properties: {
        oldPw: { type: "string", minLength: 1, maxLength: 72 },
        newPw: { type: "string", minLength: 6, maxLength: 32 },
        confirm: { type: "string", minLength: 6, maxLength: 32 }
      }
    }
};
  
// ---- AVATAR UPLOAD ----
export const avatarUploadSchema = {
    body: {
      type: "object",
      required: ["avatar"],
      additionalProperties: false,
      properties: {
        avatar: {
          type: "string",
          pattern: "^[a-zA-Z0-9_\\-\\.]+\\.(png|jpg|jpeg|gif)$"
        }
      }
    }
};
  
// ---- GAME JOIN ----
export const gameJoinSchema = {
    body: {
      type: "object",
      required: ["gameId"],
      additionalProperties: false,
      properties: {
        gameId: { type: "integer", minimum: 1 }
      }
    }
};
  
// ---- TOURNAMENT CREATE ----
export const tournamentCreateSchema = {
    body: {
      type: "object",
      required: ["name", "maxPlayers", "entryFee"],
      additionalProperties: false,
      properties: {
        name: { type: "string", minLength: 1, maxLength: 50 },
        maxPlayers: { type: "integer", minimum: 2, maximum: 64 },
        entryFee: { type: "integer", minimum: 0 }
      }
    }
};
  