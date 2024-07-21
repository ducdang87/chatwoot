import semver from 'semver';

export const hasAnUpdateAvailable = (latestVersion, currentVersion) => {
  return false;
  // eslint-disable-next-line no-unreachable
  if (!semver.valid(latestVersion)) {
    return false;
  }
  return semver.lt(currentVersion, latestVersion);
};
