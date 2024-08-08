export function timeSince(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        return interval + " years ago";
    }

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return interval + " months ago";
    }

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return interval + " days ago";
    }

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return interval + " hours ago";
    }

    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return interval + " minutes ago";
    }

    return Math.floor(seconds) + " seconds ago";
}

export function formatViews(count) {
    if (count < 1000) {
        return count.toString();
    } else if (count >= 1000 && count < 1000000) {
        return (count / 1000).toFixed(1) + 'k';
    } else if (count >= 1000000 && count < 1000000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000000000) {
        return (count / 1000000000).toFixed(1) + 'B';
    }
    return count.toString();
}