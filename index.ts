import Axios from "axios";

const mockApiUrl = "http://wiremock:8080";

/**
 * Provides access to the api mock service
 */
class ApiMockHelper {
  private touchedApiMocks: {uuid: string; priority: number}[] = [];

  /**
   * Activates a mock by changing its priority
   *
   * @param id uuid of the request to push in priority
   */
  activateApiMock = async (id: string): Promise<void> => {
    const oldPriority = await this.updateApi(id, 25);

    if (oldPriority !== 0) {
      this.touchedApiMocks.push({
        uuid: id,
        priority: oldPriority,
      });
    }
  }

  /**
   * Restore all changed mocks to default
   */
  restoreAllMocks = async (): Promise<void> => {
    await Promise.all(this.touchedApiMocks.map(
      mock => this.updateApi(mock.uuid, mock.priority),
    ));

    this.touchedApiMocks = [];
  }

  /**
   *  Changes a mocks priority
   *
   * @param uuid uuid of the request to be changed
   * @param priority priority to set
   */
  private updateApi = async (uuid: string, priority: number): Promise<number> => {
    const oldStub = await Axios.get(`${mockApiUrl}/__admin/mappings/${uuid}`).then(
      response => (response.status === 200 ? response.data : response.statusText),
    );

    if (oldStub) {
      const status = await Axios.put(`${mockApiUrl}/__admin/mappings/${uuid}`, {
        ...oldStub,
        priority,
      }).then(response => response.status);

      return status === 200 ? oldStub.priority : 0;
    }

    return 0;
  }
}

export default ApiMockHelper;
