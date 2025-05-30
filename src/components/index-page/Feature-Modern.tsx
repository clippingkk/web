import CodeHighlight from '@/components/highlighter/client'
import { useTranslation } from '@/i18n'
import Image from 'next/image'
import WebArchImage from '../../assets/web_arch.png'

const exampleCode = `
extern crate ck_cli;
use serde_json;
use std::{env, fs};
use std::fs::File;
use std::io::prelude::*;

#[test]
fn parse_en_file() {
    let file_name = "clippings_en";
    let mut current_dir = env::current_dir().unwrap();
    current_dir.push("fixtures");
    let mut src_en_file = current_dir.clone();
    src_en_file.push(format!("{}.txt", file_name));
    let mut f = File::open(src_en_file).unwrap();
    let mut result = String::new();
    f.read_to_string(&mut result).unwrap();

    let mut parsed_data = ck_cli::CKParser::do_parse(&result).unwrap();

    let mut result_en_file = current_dir.clone();
    result_en_file.push(format!("{}.result.json", file_name));
    let mut r = File::open(result_en_file).unwrap();
    let mut expected_json = String::new();
    r.read_to_string(&mut expected_json).unwrap();

    let mut expected_struct: Vec<ck_cli::CKParser::TClippingItem> =
        serde_json::from_str(&expected_json).unwrap();

    parsed_data.sort_by(|a, b| a.content.cmp(&b.content));
    expected_struct.sort_by(|a, b| a.content.cmp(&b.content));

    let ss = serde_json::to_string(&parsed_data).unwrap();
    let dd = serde_json::to_string(&expected_struct).unwrap();

    assert_eq!(ss, dd)
}
`

async function FeatureModern() {
  const { t } = await useTranslation()
  return (
    <div className="flex w-full flex-col items-center justify-around py-16">
      <h3
        className={
          'mb-8 flex max-w-xs overflow-x-visible bg-linear-to-br from-red-400 to-pink-500 bg-clip-text pb-4 text-center text-4xl font-extrabold text-transparent lg:mb-0 lg:text-7xl'
        }
      >
        {t('app.index.features.modern.title')}
      </h3>

      <div>
        <div className="flex flex-col items-center">
          <Image
            src={WebArchImage}
            alt="Web arch"
            width={WebArchImage.width}
            height={WebArchImage.height}
            style={{
              maxWidth: '100vw',
            }}
          />
          <div className="flex flex-col items-center justify-center lg:items-start">
            <h3
              className={
                'font-lxgw mb-8 flex overflow-x-visible bg-linear-to-br from-blue-300 to-orange-400 bg-clip-text pb-4 text-center text-4xl font-bold text-transparent lg:mb-0 lg:text-7xl'
              }
            >
              {t('app.index.features.modern.f1')}
            </h3>
            <span className="block text-center dark:text-gray-100">
              {t('app.index.features.modern.f1Desc')}
            </span>
          </div>
          <div></div>
        </div>

        <div className="mt-40 flex flex-col justify-around lg:flex-row">
          <div
            className="px-4 lg:px-0"
            style={{
              maxWidth: '100vw',
            }}
          >
            <CodeHighlight lang="c" code={exampleCode} />
          </div>
          <div className="flex flex-col items-center justify-center lg:items-start">
            <h3
              className={
                'font-lxgw mt-12 mb-8 flex overflow-x-visible bg-linear-to-br from-blue-300 to-orange-400 bg-clip-text pb-4 text-center text-4xl font-bold text-transparent lg:mt-0 lg:mb-0 lg:text-7xl'
              }
            >
              {t('app.index.features.modern.f2')}
            </h3>
            <span className="block text-center dark:text-gray-100">
              {t('app.index.features.modern.f2Desc')}
            </span>
          </div>
        </div>

        {/* <div className=' flex justify-around mt-40'>
          <div className='flex justify-center flex-col'>
            <h3 className={'lg:text-7xl font-lxgw font-bold text-4xl text-center mb-8 lg:mb-0 pb-4 flex overflow-x-visible from-blue-300 to-orange-400 bg-clip-text text-transparent bg-linear-to-br'}>
              {t('app.index.features.modern.f3')}
            </h3>
            <span className='text-center block'>
              {t('app.index.features.modern.f3Desc')}
            </span>
          </div>
          <div>
            hello
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default FeatureModern
