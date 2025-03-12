import chalk from 'chalk';
import figlet from 'figlet';

function banner() {
    const banner = figlet.textSync("Crypto Kidzs", {
        font: 'ANSI Shadow',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    });
    console.log(chalk.green(banner))
}
console.log(chalk.yellow('======================================'));
console.log(chalk.magenta('Github : http://github.com/0xDisciple'));
console.log(chalk.magenta('Telegram : https://t.me/CryptoKidzs'));
console.log(chalk.yellow('======================================'));
export default banner()