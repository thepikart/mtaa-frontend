function formatDate(isoString: string) {
    const date = new Date(isoString);
    return date.toLocaleString("sk-SK", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

export { formatDate };