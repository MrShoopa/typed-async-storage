const AsyncStorage = require('@react-native-community/async-storage');
const PropTypes = require('prop-types/prop-types');
const {
  createStorage,
  createMethods,
  createMultiSetter,
  createMultiGetter,
} = require('../src/createStorage');

const wrapAsyncStorage = require('../src/storage');
const { validate, validateSchema } = require('../src/validation');

jest.mock('../src/storage', () => () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  mergeItem: jest.fn(),
  multiSet: jest.fn(),
  multiGet: jest.fn(),
}));

jest.mock('@react-native-community/async-storage');

jest.mock('../src/validation');
afterEach(() => {
  validate.mockClear();
});

const storageName = 'testStorage';
const wrappedAsyncStorage = wrapAsyncStorage();

const schema = {
  age: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
};

describe('createMethods', () => {
  const methods = createMethods(schema, storageName, wrappedAsyncStorage);

  it('return methods', () => {
    expect(methods).toEqual(expect.objectContaining({
      set: expect.any(Function),
      get: expect.any(Function),
    }));
  });

  describe('`set` method', () => {
    const data = 'Nick';
    beforeAll(async () => {
      await methods.set('name', data);
    });

    it('calls `validate` inside', () => {
      expect(validate).toHaveBeenCalled();
    });

    it('calls `setItem` of wrappedAsyncStorage inside', () => {
      expect(wrappedAsyncStorage.setItem).toBeCalledWith('name', data);
    });
  });

  describe('"get" method', () => {
    it('calls `getItem` of wrappedAsyncStorage inside', async () => {
      await methods.get('name');
      expect(wrappedAsyncStorage.getItem).toBeCalledWith('name');
    });
  });

  describe('"merge" method', () => {
    const data = 'Nick';
    beforeAll(async () => {
      await methods.merge('name', data);
    });

    it('calls `validate` inside', () => {
      expect(validate).toHaveBeenCalled();
    });

    it('calls `mergeItem` inside wrappedAsyncStorage', async () => {
      await methods.merge('name', data);
      expect(wrappedAsyncStorage.mergeItem).toBeCalledWith('name', data);
    });
  });
});

describe('createMultiSetter', () => {
  const multiSetter = createMultiSetter(storageName, wrappedAsyncStorage, schema);

  it('returns multiSetter function', () => {
    expect(multiSetter).toEqual(expect.any(Function));
  });

  describe('returned multiSetter function', () => {
    const testData = 'some data';
    beforeAll(async () => {
      await multiSetter(testData);
    });

    it('calls `validate` inside', () => {
      expect(validate).toHaveBeenCalled();
    });

    it('calls `multiSet` of wrappedAsyncStorage inside', () => {
      expect(wrappedAsyncStorage.multiSet).toBeCalledWith(testData);
    });
  });
});

describe('createMultiGetter', () => {
  const multiGetter = createMultiGetter(wrappedAsyncStorage);

  it('returns multiGetter function', () => {
    expect(multiGetter).toEqual(expect.any(Function));
  });

  describe('returned multiGetter function', () => {
    it('calls `multiGet` of wrappedAsyncStorage inside', () => {
      expect(wrappedAsyncStorage.multiSet).toBeCalled();
    });
  });
});

describe('createStorage', () => {
  const testStorage = createStorage({
    schema,
    name: storageName,
    AsyncStorage,
  });

  it('calls `validateSchema`', () => {
    expect(validateSchema).toHaveBeenCalled();
  });

  it('returns result of `createMethods` function', () => {
    const methods = createMethods(schema, testStorage);
    expect(Object.keys(testStorage)).toEqual(Object.keys(methods));
  });
});
