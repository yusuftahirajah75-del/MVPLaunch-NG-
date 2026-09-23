/**
 * MVPLaunch NG - Storage Provider Interface
 */
class StorageProvider {
  async saveFile(file) {
    throw new Error('saveFile() must be implemented.');
  }
  async deleteFile(filePath) {
    throw new Error('deleteFile() must be implemented.');
  }
}

module.exports = StorageProvider;
