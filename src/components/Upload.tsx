"use client";

export default function Upload() {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        // const file = formData.get("file-input") as File;

        fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
      }}
    >
      <input type="file" name="file-input" />
      <button type="submit">submit</button>
    </form>
  );
}
