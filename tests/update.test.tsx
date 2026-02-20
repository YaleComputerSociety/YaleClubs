// Mock School enum to avoid mongoose import issues
enum School {
  COLLEGE = "Yale College",
  GRADUATE = "Graduate School of Arts & Sciences",
  LAW = "Law School",
  MEDICINE = "School of Medicine",
  DIVINITY = "Divinity School",
  NURSING = "School of Nursing",
  FORESTRY = "School of the Environment",
  ART = "School of Art",
  ARCHITECTURE = "School of Architecture",
  DRAMA = "School of Drama",
  MUSIC = "School of Music",
  MANAGEMENT = "School of Management",
  PUBLIC_HEALTH = "School of Public Health",
}

// Extracted validation functions from the update page for testing
function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateInput(field: string, value: string): string {
  const validSchools = Object.values(School) as string[];

  switch (field) {
    case "name":
      if (!value) return "Name is required.";
      if (value.length < 2) return "Name must be at least 2 characters.";
      if (value.length > 150) return "Name must not exceed 150 characters.";
      return "";
    case "school":
      if (!value) return "School is required.";
      if (!validSchools.includes(value)) return "Invalid school value. Please select a valid school.";
      return "";
    case "email":
      if (!value) return "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format.";
      if (value.length > 100) return "Email must not exceed 100 characters.";
      return "";
    case "website":
      if (!value) return "";
      if (value && !isValidUrl(value)) return "Invalid URL.";
      if (value.length > 200) return "Website URL must not exceed 200 characters.";
      return "";
    case "numMembers":
      if (!value) return "";
      if (Number(value) < 0) return "Number of members cannot be negative.";
      if (Number(value) > 10000) return "Number of members must not exceed 10,000.";
      return "";
    case "instagram":
      if (!value) return "";
      if (!/^@[\w.]+$/.test(value)) return "Instagram handle must start with '@'.";
      if (value.length > 50) return "Instagram handle must not exceed 50 characters.";
      return "";
    case "subheader":
      if (value && value.length > 150) return "Subheader must not exceed 150 characters.";
      return "";
    case "description":
      if (value && value.length > 1500) return "Description must not exceed 1500 characters.";
      return "";
    case "applyForm":
      if (value && value.length > 200) return "Application form must not exceed 200 characters.";
      if (value && !isValidUrl(value)) return "Invalid URL.";
      return "";
    case "mailingListForm":
      if (value && value.length > 200) return "Mailing list form must not exceed 200 characters.";
      if (value && !isValidUrl(value)) return "Invalid URL.";
      return "";
    case "calendarLink":
      if (value && value.length > 200) return "Calendar link must not exceed 200 characters.";
      if (value && !isValidUrl(value)) return "Invalid URL.";
      return "";
    case "meeting":
      if (value && value.length > 200) return `${field} must not exceed 200 characters.`;
      return "";
    case "howToJoin":
      if (value && value.length > 500) return "How to join must not exceed 500 characters.";
      return "";
    default:
      return "";
  }
}

describe("isValidUrl", () => {
  it("returns true for valid HTTP URLs", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
    expect(isValidUrl("http://www.example.com")).toBe(true);
  });

  it("returns true for valid HTTPS URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("https://www.example.com")).toBe(true);
  });

  it("returns true for URLs with paths", () => {
    expect(isValidUrl("https://example.com/path/to/page")).toBe(true);
  });

  it("returns true for URLs with query parameters", () => {
    expect(isValidUrl("https://example.com?query=value")).toBe(true);
    expect(isValidUrl("https://example.com/path?query=value&another=param")).toBe(true);
  });

  it("returns false for invalid URLs", () => {
    expect(isValidUrl("not a url")).toBe(false);
    expect(isValidUrl("example.com")).toBe(false);
    expect(isValidUrl("www.example.com")).toBe(false);
  });

  it("returns false for empty strings", () => {
    expect(isValidUrl("")).toBe(false);
  });
});

describe("validateInput - name field", () => {
  it("returns error when name is empty", () => {
    expect(validateInput("name", "")).toBe("Name is required.");
  });

  it("returns error when name is too short", () => {
    expect(validateInput("name", "A")).toBe("Name must be at least 2 characters.");
  });

  it("returns error when name is too long", () => {
    const longName = "A".repeat(151);
    expect(validateInput("name", longName)).toBe("Name must not exceed 150 characters.");
  });

  it("returns no error for valid names", () => {
    expect(validateInput("name", "AB")).toBe("");
    expect(validateInput("name", "Yale Computer Society")).toBe("");
    expect(validateInput("name", "A".repeat(150))).toBe("");
  });
});

describe("validateInput - school field", () => {
  it("returns error when school is empty", () => {
    expect(validateInput("school", "")).toBe("School is required.");
  });

  it("returns error for invalid school value", () => {
    expect(validateInput("school", "Invalid School")).toBe("Invalid school value. Please select a valid school.");
  });

  it("returns no error for valid school values", () => {
    Object.values(School).forEach((school) => {
      expect(validateInput("school", school)).toBe("");
    });
  });
});

describe("validateInput - email field", () => {
  it("returns no error for empty email", () => {
    expect(validateInput("email", "")).toBe("");
  });

  it("returns error for invalid email formats", () => {
    expect(validateInput("email", "notanemail")).toBe("Invalid email format.");
    expect(validateInput("email", "missing@domain")).toBe("Invalid email format.");
    expect(validateInput("email", "@missingname.com")).toBe("Invalid email format.");
    expect(validateInput("email", "missing.domain@")).toBe("Invalid email format.");
  });

  it("returns error for emails that are too long", () => {
    const longEmail = "a".repeat(90) + "@example.com";
    expect(validateInput("email", longEmail)).toBe("Email must not exceed 100 characters.");
  });

  it("returns no error for valid emails", () => {
    expect(validateInput("email", "test@yale.edu")).toBe("");
    expect(validateInput("email", "club.leader@yale.edu")).toBe("");
    expect(validateInput("email", "contact@yaleclubs.org")).toBe("");
  });
});

describe("validateInput - website field", () => {
  it("returns no error for empty website", () => {
    expect(validateInput("website", "")).toBe("");
  });

  it("returns error for invalid URLs", () => {
    expect(validateInput("website", "not a url")).toBe("Invalid URL.");
    expect(validateInput("website", "example.com")).toBe("Invalid URL.");
  });

  it("returns error for websites that are too long", () => {
    const longUrl = "https://example.com/" + "a".repeat(190);
    expect(validateInput("website", longUrl)).toBe("Website URL must not exceed 200 characters.");
  });

  it("returns no error for valid websites", () => {
    expect(validateInput("website", "https://yaleclubs.org")).toBe("");
    expect(validateInput("website", "http://www.example.com")).toBe("");
  });
});

describe("validateInput - numMembers field", () => {
  it("returns no error for empty numMembers", () => {
    expect(validateInput("numMembers", "")).toBe("");
  });

  it("returns error for negative numbers", () => {
    expect(validateInput("numMembers", "-1")).toBe("Number of members cannot be negative.");
    expect(validateInput("numMembers", "-100")).toBe("Number of members cannot be negative.");
  });

  it("returns error for numbers exceeding maximum", () => {
    expect(validateInput("numMembers", "10001")).toBe("Number of members must not exceed 10,000.");
    expect(validateInput("numMembers", "50000")).toBe("Number of members must not exceed 10,000.");
  });

  it("returns no error for valid numbers", () => {
    expect(validateInput("numMembers", "0")).toBe("");
    expect(validateInput("numMembers", "50")).toBe("");
    expect(validateInput("numMembers", "10000")).toBe("");
  });
});

describe("validateInput - instagram field", () => {
  it("returns no error for empty instagram", () => {
    expect(validateInput("instagram", "")).toBe("");
  });

  it("returns error for handles not starting with @", () => {
    expect(validateInput("instagram", "yaleclubs")).toBe("Instagram handle must start with '@'.");
    expect(validateInput("instagram", "username")).toBe("Instagram handle must start with '@'.");
  });

  it("returns error for handles with invalid characters", () => {
    expect(validateInput("instagram", "@yale clubs")).toBe("Instagram handle must start with '@'.");
    expect(validateInput("instagram", "@yale-clubs")).toBe("Instagram handle must start with '@'.");
  });

  it("returns error for handles that are too long", () => {
    const longHandle = "@" + "a".repeat(50);
    expect(validateInput("instagram", longHandle)).toBe("Instagram handle must not exceed 50 characters.");
  });

  it("returns no error for valid instagram handles", () => {
    expect(validateInput("instagram", "@yaleclubs")).toBe("");
    expect(validateInput("instagram", "@yale_clubs")).toBe("");
    expect(validateInput("instagram", "@yale.clubs")).toBe("");
  });
});

describe("validateInput - subheader field", () => {
  it("returns no error for empty subheader", () => {
    expect(validateInput("subheader", "")).toBe("");
  });

  it("returns error for subheaders that are too long", () => {
    const longSubheader = "A".repeat(151);
    expect(validateInput("subheader", longSubheader)).toBe("Subheader must not exceed 150 characters.");
  });

  it("returns no error for valid subheaders", () => {
    expect(validateInput("subheader", "A great club")).toBe("");
    expect(validateInput("subheader", "A".repeat(150))).toBe("");
  });
});

describe("validateInput - description field", () => {
  it("returns no error for empty description", () => {
    expect(validateInput("description", "")).toBe("");
  });

  it("returns error for descriptions that are too long", () => {
    const longDescription = "A".repeat(1501);
    expect(validateInput("description", longDescription)).toBe("Description must not exceed 1500 characters.");
  });

  it("returns no error for valid descriptions", () => {
    expect(validateInput("description", "This is a club description")).toBe("");
    expect(validateInput("description", "A".repeat(1500))).toBe("");
  });
});

describe("validateInput - applyForm field", () => {
  it("returns no error for empty applyForm", () => {
    expect(validateInput("applyForm", "")).toBe("");
  });

  it("returns error for invalid URLs", () => {
    expect(validateInput("applyForm", "not a url")).toBe("Invalid URL.");
  });

  it("returns error for URLs that are too long", () => {
    const longUrl = "https://forms.google.com/" + "a".repeat(180);
    expect(validateInput("applyForm", longUrl)).toBe("Application form must not exceed 200 characters.");
  });

  it("returns no error for valid URLs", () => {
    expect(validateInput("applyForm", "https://forms.google.com/apply")).toBe("");
  });
});

describe("validateInput - mailingListForm field", () => {
  it("returns no error for empty mailingListForm", () => {
    expect(validateInput("mailingListForm", "")).toBe("");
  });

  it("returns error for invalid URLs", () => {
    expect(validateInput("mailingListForm", "not a url")).toBe("Invalid URL.");
  });

  it("returns error for URLs that are too long", () => {
    const longUrl = "https://forms.google.com/" + "a".repeat(180);
    expect(validateInput("mailingListForm", longUrl)).toBe("Mailing list form must not exceed 200 characters.");
  });

  it("returns no error for valid URLs", () => {
    expect(validateInput("mailingListForm", "https://forms.google.com/mailinglist")).toBe("");
  });
});

describe("validateInput - calendarLink field", () => {
  it("returns no error for empty calendarLink", () => {
    expect(validateInput("calendarLink", "")).toBe("");
  });

  it("returns error for invalid URLs", () => {
    expect(validateInput("calendarLink", "not a url")).toBe("Invalid URL.");
  });

  it("returns error for URLs that are too long", () => {
    const longUrl = "https://calendar.google.com/" + "a".repeat(180);
    expect(validateInput("calendarLink", longUrl)).toBe("Calendar link must not exceed 200 characters.");
  });

  it("returns no error for valid URLs", () => {
    expect(validateInput("calendarLink", "https://calendar.google.com/calendar")).toBe("");
  });
});

describe("validateInput - meeting field", () => {
  it("returns no error for empty meeting", () => {
    expect(validateInput("meeting", "")).toBe("");
  });

  it("returns error for meetings that are too long", () => {
    const longMeeting = "A".repeat(201);
    expect(validateInput("meeting", longMeeting)).toBe("meeting must not exceed 200 characters.");
  });

  it("returns no error for valid meetings", () => {
    expect(validateInput("meeting", "Tuesdays from 4:00-6:00 PM on Cross Campus")).toBe("");
    expect(validateInput("meeting", "A".repeat(200))).toBe("");
  });
});

describe("validateInput - howToJoin field", () => {
  it("returns no error for empty howToJoin", () => {
    expect(validateInput("howToJoin", "")).toBe("");
  });

  it("returns error for howToJoin that is too long", () => {
    const longHowToJoin = "A".repeat(501);
    expect(validateInput("howToJoin", longHowToJoin)).toBe("How to join must not exceed 500 characters.");
  });

  it("returns no error for valid howToJoin", () => {
    expect(validateInput("howToJoin", "Join our mailing list to get updates")).toBe("");
    expect(validateInput("howToJoin", "A".repeat(500))).toBe("");
  });
});

describe("validateInput - unknown field", () => {
  it("returns empty string for unknown fields", () => {
    expect(validateInput("unknownField", "any value")).toBe("");
  });
});
